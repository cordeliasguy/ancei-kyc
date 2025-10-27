import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getUser } from '../lib/auth'
import { db } from '../db'
import {
  clients as clientsTable,
  clientDocuments as clientDocumentsTable,
  insertClientDocumentsSchema,
  insertClientsSchema
} from '../db/schema/clients'
import { and, desc, eq } from 'drizzle-orm'
import {
  createClientDocumentSchema,
  createClientSchema,
  updateClientSchema
} from '../sharedTypes'
import { utapi } from '../uploadthing'
import {
  insertKycDocumentFilesSchema,
  kycDocumentFiles as kycDocumentFilesTable,
  kycDocuments as kycDocumentsTable
} from '../db/schema'

export const clientsRoute = new Hono()
  .get('/', getUser, async ctx => {
    const agencyId = ctx.var.user.agencyId

    const clients = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.agencyId, agencyId))
      .orderBy(desc(clientsTable.createdAt))
      .limit(100)

    return ctx.json({ clients })
  })
  .get('/with-documents', getUser, async ctx => {
    const agencyId = ctx.var.user.agencyId

    const clients = await db.query.clients.findMany({
      where: eq(clientsTable.agencyId, agencyId),
      with: {
        documents: true // eager load documents[]
      },
      orderBy: (clients, { desc }) => [desc(clients.createdAt)],
      limit: 100
    })

    return ctx.json({ clients })
  })
  .post('/', getUser, zValidator('json', createClientSchema), async ctx => {
    const client = ctx.req.valid('json')
    const user = ctx.var.user

    const validatedClient = insertClientsSchema.parse({
      ...client,
      agencyId: user.agencyId
    })

    const result = await db
      .insert(clientsTable)
      .values(validatedClient)
      .returning()
      .then(res => res[0])

    return ctx.json(result, { status: 201 })
  })
  .get('/:id{[0-9a-fA-F-]{36}}', async ctx => {
    const id = ctx.req.param('id')

    const client = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, id))
      .then(res => res[0])

    if (!client) return ctx.notFound()

    return ctx.json({ client })
  })
  .patch(
    '/:id{[0-9a-fA-F-]{36}}',
    getUser,
    zValidator('json', updateClientSchema),
    async ctx => {
      const id = ctx.req.param('id')

      const validatedClient = updateClientSchema.parse(ctx.req.valid('json'))

      const result = await db
        .update(clientsTable)
        .set(validatedClient)
        .where(eq(clientsTable.id, id))
        .returning()
        .then(res => res[0])

      return ctx.json(result, { status: 200 })
    }
  )
  .delete('/:id{[0-9a-fA-F-]{36}}', getUser, async ctx => {
    const id = ctx.req.param('id')
    const user = ctx.var.user

    // Get the client's documents
    const documentsUrls = await db
      .select()
      .from(clientDocumentsTable)
      .where(eq(clientDocumentsTable.clientId, id))
      .then(res => res.map(doc => doc.url))

    // Delete the client's documents from uploadthing
    await utapi.deleteFiles(
      documentsUrls.map(url => url.split('/').filter(Boolean).pop() || '')
    )

    // Delete the client from the database
    const client = await db
      .delete(clientsTable)
      .where(
        and(eq(clientsTable.agencyId, user.agencyId), eq(clientsTable.id, id))
      )
      .returning()
      .then(res => res[0])

    if (!client) return ctx.notFound()

    return ctx.json({ client })
  })
  .get('/:clientId{[0-9a-fA-F-]{36}}/documents', getUser, async ctx => {
    const clientId = ctx.req.param('clientId')

    const documents = await db
      .select()
      .from(clientDocumentsTable)
      .where(eq(clientDocumentsTable.clientId, clientId))
      .orderBy(desc(clientDocumentsTable.uploadedAt))
      .limit(100)

    return ctx.json({ documents })
  })
  .get('/:clientId{[0-9a-fA-F-]{36}}/kycs', getUser, async ctx => {
    const clientId = ctx.req.param('clientId')

    const kycs = await db
      .select()
      .from(kycDocumentsTable)
      .where(eq(kycDocumentsTable.clientId, clientId))
      .orderBy(desc(kycDocumentsTable.createdAt))
      .limit(100)

    return ctx.json({ kycs })
  })
  .post(
    '/:clientId{[0-9a-fA-F-]{36}}/document',
    getUser,
    zValidator('json', createClientDocumentSchema),
    async ctx => {
      const document = ctx.req.valid('json')
      const clientId = ctx.req.param('clientId')

      const validatedDocument = insertClientDocumentsSchema.parse({
        ...document,
        clientId
      })

      const result = await db
        .insert(clientDocumentsTable)
        .values(validatedDocument)
        .returning()
        .then(res => res[0])

      return ctx.json(result, { status: 201 })
    }
  )
  .get('/:documentId{[0-9a-fA-F-]{36}}/linked', getUser, async ctx => {
    const documentId = ctx.req.param('documentId')

    const linkedDocuments = await db
      .select()
      .from(kycDocumentFilesTable)
      .where(eq(kycDocumentFilesTable.documentId, documentId))
      .orderBy(desc(kycDocumentFilesTable.linkedAt))
      .limit(100)

    return ctx.json({ linkedDocuments })
  })
  .post(
    '/:documentId{[0-9a-fA-F-]{36}}/:kycId{[0-9a-fA-F-]{36}}/link',
    async ctx => {
      const documentId = ctx.req.param('documentId')
      const kycId = ctx.req.param('kycId')

      const validatedEntry = insertKycDocumentFilesSchema.parse({
        kycDocumentId: kycId,
        documentId: documentId
      })

      const result = await db
        .insert(kycDocumentFilesTable)
        .values(validatedEntry)
        .returning()
        .then(res => res[0])

      return ctx.json(result, { status: 201 })
    }
  )
  .delete(
    '/:documentId{[0-9a-fA-F-]{36}}/:kycId{[0-9a-fA-F-]{36}}/unlink',
    async ctx => {
      const documentId = ctx.req.param('documentId')
      const kycId = ctx.req.param('kycId')

      const result = await db
        .delete(kycDocumentFilesTable)
        .where(
          and(
            eq(kycDocumentFilesTable.documentId, documentId),
            eq(kycDocumentFilesTable.kycDocumentId, kycId)
          )
        )
        .returning()
        .then(res => res[0])

      if (!result) return ctx.notFound()

      return ctx.json(result, { status: 200 })
    }
  )
  .delete(
    '/:clientId{[0-9a-fA-F-]{36}}/document/:documentId{[0-9a-fA-F-]{36}}',
    getUser,
    async ctx => {
      const clientId = ctx.req.param('clientId')
      const documentId = ctx.req.param('documentId')

      // Delete the document from the database
      const document = await db
        .delete(clientDocumentsTable)
        .where(
          and(
            eq(clientDocumentsTable.clientId, clientId),
            eq(clientDocumentsTable.id, documentId)
          )
        )
        .returning()
        .then(res => res[0])

      if (!document) return ctx.notFound()

      // Delete the document from the uploadthing bucket
      await utapi.deleteFiles(
        document.url.split('/').filter(Boolean).pop() || ''
      )

      return ctx.json({ document })
    }
  )
