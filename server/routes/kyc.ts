import { Hono } from 'hono'

import { db } from '../db'
import {
  kycDocuments as kycDocumentsTable,
  relatedPersons as relatedPersonsTable,
  managementPersons as managementPersonsTable,
  shareholders as shareholdersTable,
  ubos as ubosTable,
  kycDocumentFiles as kycDocumentFilesTable,
  insertKycSchema,
  insertRelatedPersonsSchema,
  insertManagementPersonsSchema,
  insertShareholdersSchema,
  insertUbosSchema
} from '../db/schema/kyc'
import { clientDocuments as clientDocumentsTable } from '../db/schema/clients'
import { eq, desc, and, notInArray } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import {
  createKycDocumentSchema,
  createManagementPersonsSchema,
  createRelatedPersonsSchema,
  createShareholdersSchema,
  createUbosSchema
} from '../sharedTypes'
import { getUser } from '../lib/auth'

export const kycRoute = new Hono()
  .get('/', getUser, async ctx => {
    const agencyId = ctx.var.user.agencyId

    const kycDocuments = await db
      .select()
      .from(kycDocumentsTable)
      .where(eq(kycDocumentsTable.agencyId, agencyId))
      .orderBy(desc(kycDocumentsTable.createdAt))
      .limit(100)

    return ctx.json({
      kycDocuments
    })
  })
  .get('/:id{[0-9a-fA-F-]{36}}', async c => {
    const id = c.req.param('id')

    const kyc = await db
      .select()
      .from(kycDocumentsTable)
      .where(eq(kycDocumentsTable.id, id))
      .then(res => res[0])

    if (!kyc) return c.notFound()

    return c.json({ kyc })
  })
  .post('/', zValidator('json', createKycDocumentSchema), async ctx => {
    const document = ctx.req.valid('json')

    const validatedDocument = insertKycSchema.parse(document)

    const result = await db
      .insert(kycDocumentsTable)
      .values(validatedDocument)
      .returning()
      .then(res => res[0])

    return ctx.json(result, { status: 201 })
  })
  .get('/:id{[0-9a-fA-F-]{36}}/documents', async ctx => {
    const id = ctx.req.param('id')

    const documents = await db
      .select({
        documentId: kycDocumentFilesTable.documentId,
        kycDocumentId: kycDocumentFilesTable.kycDocumentId,
        linkedAt: kycDocumentFilesTable.linkedAt,
        name: clientDocumentsTable.name,
        url: clientDocumentsTable.url
      })
      .from(kycDocumentFilesTable)
      .innerJoin(
        clientDocumentsTable,
        eq(kycDocumentFilesTable.documentId, clientDocumentsTable.id)
      )
      .where(eq(kycDocumentFilesTable.kycDocumentId, id))
      .orderBy(desc(kycDocumentFilesTable.linkedAt))
      .limit(100)

    return ctx.json({ documents })
  })
  .patch(
    '/:id{[0-9a-fA-F-]{36}}',
    zValidator('json', createKycDocumentSchema),
    async ctx => {
      const id = ctx.req.param('id')

      const document = await db
        .select()
        .from(kycDocumentsTable)
        .where(eq(kycDocumentsTable.id, id))
        .then(res => res[0])

      if (!document) return ctx.notFound()

      const data = ctx.req.valid('json')
      const validatedData = insertKycSchema.parse(data)

      const result = await db
        .update(kycDocumentsTable)
        .set(validatedData)
        .where(eq(kycDocumentsTable.id, id))
        .returning()
        .then(res => res[0])

      return ctx.json(result, { status: 200 })
    }
  )
  .post(
    '/related-persons',
    zValidator('json', createRelatedPersonsSchema),
    async ctx => {
      const persons = ctx.req.valid('json')

      // Extract the kycId (assuming all persons have the same kycId)
      const kycId = persons[0]?.kycId

      if (!kycId) {
        return ctx.json({ error: 'kycId is required' }, { status: 400 })
      }

      // Get IDs from the incoming array
      const incomingIds = persons
        .map(p => p.id)
        .filter((id): id is string => id !== undefined && id !== null)

      // Delete related persons that belong to this kycId but are NOT in the incoming array
      if (incomingIds.length > 0) {
        await db
          .delete(relatedPersonsTable)
          .where(
            and(
              eq(relatedPersonsTable.kycId, kycId),
              notInArray(relatedPersonsTable.id, incomingIds)
            )
          )
      } else {
        // If no IDs provided, delete all related persons for this kycId
        await db
          .delete(relatedPersonsTable)
          .where(eq(relatedPersonsTable.kycId, kycId))
      }

      // Process each person individually to handle upsert logic
      const results = []
      for (const person of persons) {
        const result = await db
          .insert(relatedPersonsTable)
          .values(person)
          .onConflictDoUpdate({
            target: relatedPersonsTable.id,
            set: {
              fullName: person.fullName,
              position: person.position,
              period: person.period,
              country: person.country,
              relationship: person.relationship
            }
          })
          .returning()

        results.push(result[0])
      }

      return ctx.json(results, { status: 201 })
    }
  )
  .post(
    '/management-persons',
    zValidator('json', createManagementPersonsSchema),
    async ctx => {
      const persons = ctx.req.valid('json')

      // Extract the kycId (assuming all persons have the same kycId)
      const kycId = persons[0]?.kycId

      if (!kycId) {
        return ctx.json({ error: 'kycId is required' }, { status: 400 })
      }

      // Get IDs from the incoming array
      const incomingIds = persons
        .map(p => p.id)
        .filter((id): id is string => id !== undefined && id !== null)

      // Delete management persons that belong to this kycId but are NOT in the incoming array
      if (incomingIds.length > 0) {
        await db
          .delete(managementPersonsTable)
          .where(
            and(
              eq(managementPersonsTable.kycId, kycId),
              notInArray(managementPersonsTable.id, incomingIds)
            )
          )
      } else {
        // If no IDs provided, delete all management persons for this kycId
        await db
          .delete(managementPersonsTable)
          .where(eq(managementPersonsTable.kycId, kycId))
      }

      // Process each person individually to handle upsert logic
      const results = []
      for (const person of persons) {
        const result = await db
          .insert(managementPersonsTable)
          .values(person)
          .onConflictDoUpdate({
            target: managementPersonsTable.id,
            set: {
              fullName: person.fullName,
              position: person.position,
              documentNumber: person.documentNumber,
              dateOfBirth: person.dateOfBirth,
              type: person.type,
              countryOfBirth: person.countryOfBirth,
              countryOfResidence: person.countryOfResidence
            }
          })
          .returning()

        results.push(result[0])
      }

      return ctx.json(results, { status: 201 })
    }
  )
  .post(
    '/shareholders',
    zValidator('json', createShareholdersSchema),
    async ctx => {
      const shareholders = ctx.req.valid('json')

      // Extract the kycId (assuming all shareholders have the same kycId)
      const kycId = shareholders[0]?.kycId

      if (!kycId) {
        return ctx.json({ error: 'kycId is required' }, { status: 400 })
      }

      // Get IDs from the incoming array
      const incomingIds = shareholders
        .map(s => s.id)
        .filter((id): id is string => id !== undefined && id !== null)

      // Delete shareholders that belong to this kycId but are NOT in the incoming array
      if (incomingIds.length > 0) {
        await db
          .delete(shareholdersTable)
          .where(
            and(
              eq(shareholdersTable.kycId, kycId),
              notInArray(shareholdersTable.id, incomingIds)
            )
          )
      } else {
        // If no IDs provided, delete all shareholders for this kycId
        await db
          .delete(shareholdersTable)
          .where(eq(shareholdersTable.kycId, kycId))
      }

      // Process each shareholder individually to handle upsert logic
      const results = []
      for (const shareholder of shareholders) {
        const result = await db
          .insert(shareholdersTable)
          .values(shareholder)
          .onConflictDoUpdate({
            target: shareholdersTable.id,
            set: {
              fullName: shareholder.fullName,
              documentNumber: shareholder.documentNumber,
              dateOfBirth: shareholder.dateOfBirth,
              professionalActivity: shareholder.professionalActivity,
              countryOfBirth: shareholder.countryOfBirth,
              countryOfResidence: shareholder.countryOfResidence,
              ownershipPercentage: shareholder.ownershipPercentage
            }
          })
          .returning()

        results.push(result[0])
      }

      return ctx.json(results, { status: 201 })
    }
  )
  .post('/ubos', zValidator('json', createUbosSchema), async ctx => {
    const ubos = ctx.req.valid('json')

    // Extract the kycId (assuming all ubos have the same kycId)
    const kycId = ubos[0]?.kycId

    if (!kycId) {
      return ctx.json({ error: 'kycId is required' }, { status: 400 })
    }

    // Get IDs from the incoming array
    const incomingIds = ubos
      .map(u => u.id)
      .filter((id): id is string => id !== undefined && id !== null)

    // Delete ubos that belong to this kycId but are NOT in the incoming array
    if (incomingIds.length > 0) {
      await db
        .delete(ubosTable)
        .where(
          and(eq(ubosTable.kycId, kycId), notInArray(ubosTable.id, incomingIds))
        )
    } else {
      // If no IDs provided, delete all ubos for this kycId
      await db.delete(ubosTable).where(eq(ubosTable.kycId, kycId))
    }

    // Process each ubo individually to handle upsert logic
    const results = []
    for (const ubo of ubos) {
      const result = await db
        .insert(ubosTable)
        .values(ubo)
        .onConflictDoUpdate({
          target: ubosTable.id,
          set: {
            fullName: ubo.fullName,
            nationality: ubo.nationality,
            documentNumber: ubo.documentNumber,
            position: ubo.position
          }
        })
        .returning()

      results.push(result[0])
    }

    return ctx.json(results, { status: 201 })
  })
  .get('/:id{[0-9a-fA-F-]{36}}/related-persons', async ctx => {
    const kycId = ctx.req.param('id')

    const relatedPersons = await db
      .select()
      .from(relatedPersonsTable)
      .where(eq(relatedPersonsTable.kycId, kycId))
      .orderBy(desc(relatedPersonsTable.createdAt))
      .limit(100)

    return ctx.json({ relatedPersons })
  })
  .get('/:id{[0-9a-fA-F-]{36}}/management-members', async ctx => {
    const kycId = ctx.req.param('id')

    const managementMembers = await db
      .select()
      .from(managementPersonsTable)
      .where(eq(managementPersonsTable.kycId, kycId))
      .orderBy(desc(managementPersonsTable.createdAt))
      .limit(100)

    return ctx.json({ managementMembers })
  })
  .get('/:id{[0-9a-fA-F-]{36}}/shareholders', async ctx => {
    const kycId = ctx.req.param('id')

    const shareholders = await db
      .select()
      .from(shareholdersTable)
      .where(eq(shareholdersTable.kycId, kycId))
      .orderBy(desc(shareholdersTable.createdAt))
      .limit(100)

    return ctx.json({ shareholders })
  })
  .get('/:id{[0-9a-fA-F-]{36}}/ubos', async ctx => {
    const kycId = ctx.req.param('id')

    const ubos = await db
      .select()
      .from(ubosTable)
      .where(eq(ubosTable.kycId, kycId))
      .orderBy(desc(ubosTable.createdAt))
      .limit(100)

    return ctx.json({ ubos })
  })
