import { Hono } from 'hono'

import { db } from '../db'
import { agencies as agenciesTable } from '../db/schema/agencies'
import { eq } from 'drizzle-orm'

export const agenciesRoute = new Hono()
  .get('/', async c => {
    const agencies = await db.select().from(agenciesTable)

    return c.json({
      agencies: agencies
    })
  })
  .get('/:id', async c => {
    const id = c.req.param('id')
    const agency = await db
      .select()
      .from(agenciesTable)
      .where(eq(agenciesTable.id, id))
      .then(res => res[0])

    if (!agency) return c.notFound()

    return c.json({ agency })
  })
