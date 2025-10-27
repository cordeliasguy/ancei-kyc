import { Hono } from 'hono'

import { db } from '../db'
import { agencies as agenciesTable } from '../db/schema/agencies'
import {
  clients as clientsTable,
  clientDocuments as clientDocumentsTable
} from '../db/schema/clients'
import { and, gte, lte, inArray, eq, desc } from 'drizzle-orm'
import { getUser } from '../lib/auth'

export const agenciesRoute = new Hono()
  .get('/', async ctx => {
    const agencies = await db
      .select()
      .from(agenciesTable)
      .orderBy(desc(agenciesTable.createdAt))
      .limit(100)

    return ctx.json({
      agencies
    })
  })
  .get('/:id{[0-9a-fA-F-]{36}}', async ctx => {
    const id = ctx.req.param('id')
    const agency = await db
      .select()
      .from(agenciesTable)
      .where(eq(agenciesTable.id, id))
      .then(res => res[0])

    if (!agency) return ctx.notFound()

    return ctx.json({ agency })
  })
  .get('/expiring-documents', getUser, async ctx => {
    const agencyId = ctx.var.user.agencyId

    // Date range: today -> 30 days from now
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)

    // Convert to ISO strings (YYYY-MM-DD)
    const todayStr = now.toISOString().split('T')[0]
    const in30DaysStr = thirtyDaysFromNow.toISOString().split('T')[0]

    // Get clients belonging to the agency
    const clients = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(eq(clientsTable.agencyId, agencyId))

    const clientIds = clients.map(c => c.id)

    if (clientIds.length === 0 || !todayStr || !in30DaysStr) {
      return ctx.json({ documents: [] })
    }

    // Get documents expiring within 30 days
    const documents = await db
      .select()
      .from(clientDocumentsTable)
      .where(
        and(
          inArray(clientDocumentsTable.clientId, clientIds),
          gte(clientDocumentsTable.expiresAt, todayStr),
          lte(clientDocumentsTable.expiresAt, in30DaysStr)
        )
      )

    return ctx.json({ documents })
  })
