import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'

import { auth } from './lib/auth'
import { authRoute } from './routes/auth'
import { kycRoute } from './routes/kyc'
import { usersRoute } from './routes/users'
import { clientsRoute } from './routes/clients'
import { agenciesRoute } from './routes/agencies'

import { createRouteHandler } from 'uploadthing/server'
import { fileRouter } from './uploadthing'

const app = new Hono()

// CORS configuration - allow both dev and prod origins
const allowedOrigins = [
  'http://localhost:5173', // Development
  'https://ancei-kyc.onrender.com', // Production
  'https://convinced-sophronia-cordelia-38f9cb9e.koyeb.app/'
]

app.use(
  '/*',
  cors({
    origin: allowedOrigins,
    credentials: true
  })
)

// UploadThing routes
const handlers = createRouteHandler({
  router: fileRouter,
  config: {
    token: import.meta.env.UPLOADTHING_TOKEN
  }
})

app.all('/api/uploadthing', context => handlers(context.req.raw))

// Mount Better Auth routes
app.on(['POST', 'GET'], '/api/auth/*', c => {
  return auth.handler(c.req.raw)
})

const apiRoutes = app
  .basePath('/api')
  .route('/', authRoute)
  .route('/kyc', kycRoute)
  .route('/users', usersRoute)
  .route('/clients', clientsRoute)
  .route('/agencies', agenciesRoute)

app.use('*', serveStatic({ root: './frontend/dist' }))
app.use('*', serveStatic({ path: './frontend/dist/index.html' }))

export default app
export type ApiRoutes = typeof apiRoutes
