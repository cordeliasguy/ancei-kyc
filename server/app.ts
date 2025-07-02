import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { clientsRoute } from './routes/clients'

const app = new Hono()

app.use('*', logger())

const apiRoutes = app.basePath('/api').route('/clients', clientsRoute)

app.use('*', serveStatic({ root: './frontend/dist' }))
app.use('*', serveStatic({ path: './frontend/dist/index.html' }))

export default app
export type ApiRoutes = typeof apiRoutes
