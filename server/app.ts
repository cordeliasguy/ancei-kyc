import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'

import { auth } from './lib/auth'

import { clientsRoute } from './routes/clients'
import { agenciesRoute } from './routes/agencies'
import { usersRoute } from './routes/users'
import { authRoute } from './routes/auth'

const app = new Hono()

// CORS configuration - allow both dev and prod origins
const allowedOrigins = [
  'http://localhost:5173', // Development
  'https://near-barbaraanne-cordelia-e5f335b6.koyeb.app' // Production
]

app.use(
  '/*',
  cors({
    origin: allowedOrigins,
    credentials: true
  })
)

// Mount Better Auth routes
app.on(['POST', 'GET'], '/api/auth/*', c => {
  return auth.handler(c.req.raw)
})

const apiRoutes = app
  .basePath('/api')
  .route('/clients', clientsRoute)
  .route('/agencies', agenciesRoute)
  .route('/users', usersRoute)
  .route('/', authRoute)

app.use('*', serveStatic({ root: './frontend/dist' }))
app.use('*', serveStatic({ path: './frontend/dist/index.html' }))

export default app
export type ApiRoutes = typeof apiRoutes
