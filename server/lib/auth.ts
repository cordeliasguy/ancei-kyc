import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import { user, account, session, verification } from '../db/schema/auth'
import { createMiddleware } from 'hono/factory'
import type { User } from 'better-auth/types'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      account,
      session,
      verification
    }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!
})

type Env = {
  Variables: {
    user: User
  }
}

export const getUser = createMiddleware<Env>(async (ctx, next) => {
  try {
    const data = await auth.api.getSession({
      headers: ctx.req.raw.headers
    })

    if (!data) {
      return ctx.json({ error: 'Unauthorized' }, 401)
    }

    ctx.set('user', data.user)

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return ctx.json({ error: 'Unauthorized' }, 401)
  }
})
