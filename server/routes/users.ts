import { Hono } from 'hono'
import { z } from 'zod'

import { db } from '../db'
import { user as usersTable } from '../db/schema/auth'
import { eq, desc } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { auth, getUser } from '../lib/auth'
import {
  createUserSchema,
  updateUserSchema,
  userRoleSchema
} from '../sharedTypes'

export const usersRoute = new Hono()
  .post('/', getUser, zValidator('json', createUserSchema), async ctx => {
    const validatedData = ctx.req.valid('json')
    const agencyId = ctx.var.user.agencyId

    const { user } = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        role: validatedData.role,
        agencyId: agencyId
      }
    })

    return ctx.json({ user })
  })
  .get('/', getUser, async ctx => {
    const agencyId = ctx.var.user.agencyId

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.agencyId, agencyId))
      .orderBy(desc(usersTable.createdAt))
      .limit(100)

    return ctx.json({ users })
  })
  .delete('/:id', getUser, async ctx => {
    const id = ctx.req.param('id')
    const currentUser = ctx.var.user

    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      return ctx.json({ error: 'Unauthorized' }, 403)
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === id) {
      return ctx.json({ error: 'Cannot delete your own account' }, 400)
    }

    const user = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning()
      .then(res => res[0])

    if (!user) {
      return ctx.json({ error: 'User not found' }, 404)
    }

    return ctx.json({ user })
  })
  .patch('/:id', getUser, zValidator('json', updateUserSchema), async ctx => {
    const id = ctx.req.param('id')
    const data = ctx.req.valid('json')

    const validatedUserData = updateUserSchema.parse(data)

    const user = await db
      .update(usersTable)
      .set(validatedUserData)
      .where(eq(usersTable.id, id))
      .returning()
      .then(res => res[0])

    if (!user) {
      return ctx.json({ error: 'User not found' }, 404)
    }

    return ctx.json({ user })
  })
