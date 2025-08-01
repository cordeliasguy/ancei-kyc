import { Hono } from 'hono'
import { z } from 'zod'

import { db } from '../db'
import { user as usersTable } from '../db/schema/auth'
import { eq } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { auth } from '../lib/auth'

const updateUserSchema = z.object({
  role: z.enum(['admin', 'ocic', 'compliance', 'responsible']).optional(),
  agencyId: z.string().optional()
})

export const usersRoute = new Hono().put(
  '/',
  zValidator('json', updateUserSchema),
  async c => {
    const data = c.req.valid('json')

    // 1. get the logged-in user
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'unauthorized' }, 401)

    // 2. update the user row
    await db
      .update(usersTable)
      .set({
        role: data.role,
        agencyId: data.agencyId
      })
      .where(eq(usersTable.id, session.user.id))

    return c.json({ ok: true })
  }
)
