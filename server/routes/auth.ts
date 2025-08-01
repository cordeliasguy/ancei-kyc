import { Hono } from 'hono'
import { getUser } from '../lib/auth'

export const authRoute = new Hono().get('/me', getUser, async ctx => {
  const user = ctx.var.user
  return ctx.json({ user })
})
