import {
  insertClientsSchema,
  insertClientDocumentsSchema,
  selectClientsSchema,
  selectClientDocumentsSchema,
  patchClientSchema,
  insertRelatedPersonsSchema,
  selectAgenciesSchema,
  selectRelatedPersonsSchema,
  insertKycSchema,
  selectKycSchema,
  selectManagementPersonsSchema,
  insertShareholdersSchema,
  selectShareholdersSchema,
  selectUbosSchema,
  kycStatusEnum,
  insertManagementPersonsSchema,
  insertUbosSchema,
  kycTypeEnum,
  insertUserSchema,
  selectUserSchema
} from './db/schema'
import { z } from 'zod/v4'

export const createClientSchema = insertClientsSchema.omit({
  id: true,
  agencyId: true,
  createdAt: true
})

const apiClientsSchema = selectClientsSchema.extend({
  createdAt: z.iso.datetime()
})

export const updateClientSchema = patchClientSchema.omit({
  id: true,
  agencyId: true,
  createdAt: true,
  type: true
})

export type Client = z.infer<typeof apiClientsSchema>
export type CreateClient = z.infer<typeof createClientSchema>
export type ClientWithDocuments = Client & {
  documents: ClientDocument[]
}
export type UpdateClient = z.infer<typeof updateClientSchema>

export const createClientDocumentSchema = insertClientDocumentsSchema.omit({
  id: true,
  clientId: true,
  uploadedAt: true
})

const apiClientDocumentsSchema = selectClientDocumentsSchema.extend({
  uploadedAt: z.iso.datetime()
})

export type ClientDocument = z.infer<typeof apiClientDocumentsSchema>
export type CreateClientDocument = z.infer<typeof createClientDocumentSchema>

export type Agency = z.infer<typeof selectAgenciesSchema>

const createRelatedPersonSchema = insertRelatedPersonsSchema
  .omit({
    createdAt: true
  })
  .extend({
    id: insertRelatedPersonsSchema.shape.id.optional()
  })
export const createRelatedPersonsSchema = z.array(createRelatedPersonSchema)

export type RelatedPerson = z.infer<typeof selectRelatedPersonsSchema>
export type CreateRelatedPerson = z.infer<typeof createRelatedPersonSchema>
export type FormRelatedPerson = CreateRelatedPerson & { id: string }

const createManagementPersonSchema = insertManagementPersonsSchema
  .omit({
    createdAt: true
  })
  .extend({
    id: insertManagementPersonsSchema.shape.id.optional()
  })
export const createManagementPersonsSchema = z.array(
  createManagementPersonSchema
)

export type ManagementPerson = z.infer<typeof selectManagementPersonsSchema>
export type CreateManagementPerson = z.infer<
  typeof createManagementPersonSchema
>
export type FormManagementPerson = CreateManagementPerson & { id: string }

const createShareholderSchema = insertShareholdersSchema
  .omit({
    createdAt: true
  })
  .extend({
    id: insertShareholdersSchema.shape.id.optional()
  })
export const createShareholdersSchema = z.array(createShareholderSchema)

export type Shareholder = z.infer<typeof selectShareholdersSchema>
export type CreateShareholder = z.infer<typeof createShareholderSchema>
export type FormShareholder = CreateShareholder & { id: string }

const createUboSchema = insertUbosSchema
  .omit({
    createdAt: true
  })
  .extend({
    id: insertUbosSchema.shape.id.optional()
  })
export const createUbosSchema = z.array(createUboSchema)

export type Ubo = z.infer<typeof selectUbosSchema>
export type CreateUbo = z.infer<typeof createUboSchema>
export type FormUbo = CreateUbo & { id: string }

export const createKycDocumentSchema = insertKycSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export type KycDocument = z.infer<typeof selectKycSchema>
export type CreateKycDocument = z.infer<typeof createKycDocumentSchema>

const kycServiceTypeSchema = z.enum([
  'corporate_accounting',
  'immigration',
  'company_formation',
  'personal_income_tax',
  'coworking'
])

export type KycServiceType = z.infer<typeof kycServiceTypeSchema>
export type KycStatus = (typeof kycStatusEnum.enumValues)[number]
export type EntityType = (typeof kycTypeEnum.enumValues)[number]

export const userRoleSchema = z.enum([
  'responsible',
  'compliance',
  'ocic',
  'admin'
])

export type UserRole = z.infer<typeof userRoleSchema>

export const createUserSchema = insertUserSchema
  .omit({
    id: true,
    emailVerified: true,
    image: true,
    createdAt: true,
    updatedAt: true,
    agencyId: true
  })
  .extend({
    password: z.string().min(8)
  })

export type CreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = insertUserSchema.omit({
  id: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  agencyId: true
})

export type UpdateUser = z.infer<typeof updateUserSchema>

const apiUserSchema = selectUserSchema.extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export type User = z.infer<typeof apiUserSchema>
