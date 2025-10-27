import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
  primaryKey
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { clientDocuments, clients } from './clients'
import { agencies } from './agencies'

// Enum for KYC type
export const kycTypeEnum = pgEnum('kyc_type', ['natural', 'legal'])

// Enum for KYC status
export const kycStatusEnum = pgEnum('kyc_status', [
  'submitted',
  'responsible_reviewed',
  'compliance_reviewed',
  'completed'
])

// Enum for KYC services
export const kycServiceTypeEnum = pgEnum('kyc_service_type', [
  'corporate_accounting',
  'immigration',
  'company_formation',
  'personal_income_tax',
  'coworking'
])

// Enum for KYC files
export const kycFileTypeEnum = pgEnum('kyc_file_type', ['signature', 'other'])

export const kycDocuments = pgTable(
  'kyc_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    agencyId: uuid('agency_id')
      .references(() => agencies.id, { onDelete: 'cascade' })
      .notNull(),
    type: kycTypeEnum('type').notNull(),
    status: kycStatusEnum('status').default('submitted').notNull(),
    services: kycServiceTypeEnum('services').array().notNull(),

    // -------------------------
    // NATURAL PERSON FIELDS
    // -------------------------
    fullName: text('full_name'),
    birthDate: varchar('birth_date', { length: 20 }),
    birthCountry: text('birth_country'),
    nationality: text('nationality'),
    documentType: text('document_type'),
    documentNumber: text('document_number'),
    gender: text('gender'),
    professionalActivity: text('professional_activity'),
    profession: text('profession'),
    maritalStatus: text('marital_status'),
    partnerFullName: text('partner_full_name'),
    maritalEconomicRegime: text('marital_economic_regime'),
    phone: varchar('phone', { length: 30 }),
    email: varchar('email', { length: 100 }),

    // -------------------------
    // LEGAL ENTITY FIELDS
    // -------------------------
    companyName: text('company_name'),
    companyPhone: varchar('company_phone', { length: 30 }),
    companyEmail: varchar('company_email', { length: 100 }),
    registrationDate: varchar('registration_date', { length: 20 }),
    registrationCity: text('registration_city'),
    taxId: varchar('tax_id', { length: 50 }),
    companyPurpose: text('company_purpose'),
    geographicScope: text('geographic_scope'),
    annualRevenue: text('annual_revenue'),

    hasBranches: text('has_branches'),
    branchesDetails: text('branches_details'),
    isMainBranch: text('is_main_branch'),
    mainBranchDetails: text('main_branch_details'),
    isListedOnRegulatedMarket: text('is_listed_on_regulated_market'),
    regulatedMarketDetails: text('regulated_market_details'),

    // Representative (for legal entities)
    representativeFullName: text('representative_full_name'),
    representativeDateOfBirth: varchar('representative_date_of_birth', {
      length: 20
    }),
    representativeCountryOfBirth: text('representative_country_of_birth'),
    representativeNationality: text('representative_nationality'),
    representativeDocumentType: text('representative_document_type'),
    representativeDocumentNumber: text('representative_document_number'),
    representativeGender: text('representative_gender'),
    representativeProfessionalActivity: text(
      'representative_professional_activity'
    ),
    representativeProfession: text('representative_profession'),
    representativeMaritalStatus: text('representative_marital_status'),
    representativePartnerFullName: text('representative_partner_full_name'),
    representativeMaritalEconomicRegime: text(
      'representative_marital_economic_regime'
    ),
    representativePhone: varchar('representative_phone', { length: 30 }),
    representativeEmail: varchar('representative_email', { length: 100 }),

    // -------------------------
    // COMMON ADDRESSES
    // -------------------------
    fiscalAddress: text('fiscal_address'),
    fiscalCity: text('fiscal_city'),
    fiscalPostalCode: varchar('fiscal_postal_code', { length: 20 }),
    fiscalCountry: text('fiscal_country'),
    postalAddress: text('postal_address'),
    postalCity: text('postal_city'),
    postalPostalCode: varchar('postal_postal_code', { length: 20 }),
    postalCountry: text('postal_country'),

    // -------------------------
    // COMMON DECLARATIONS
    // -------------------------
    fundsNotFromMoneyLaundering: boolean('funds_not_from_money_laundering'),
    fundsSource: boolean('funds_source'),
    fundsSourceDetails: text('funds_source_details'),
    actingOnOwnBehalf: boolean('acting_on_own_behalf'),
    actingOnBehalfOfThirdParty: boolean('acting_on_behalf_of_third_party'),
    thirdPartyRepresented: text('third_party_represented'),

    authorizedVerification: boolean('authorized_verification'),
    noTaxProcedure: boolean('no_tax_procedure'),
    legalFundsOrigin: boolean('legal_funds_origin'),

    // -------------------------
    // COMMON BUSINESS PURPOSE
    // -------------------------
    businessPurpose: text('business_purpose'),
    cashUsage: text('cash_usage'),
    isRiskySector: text('is_risky_sector'),
    riskySector: text('risky_sector'),

    // -------------------------
    // PEP / EXPOSURE DECLARATIONS
    // -------------------------
    isPEP: text('is_pep'), // natural
    isSelfExposed: text('is_self_exposed'),
    isFamilyExposed: text('is_family_exposed'),
    isAssociatesExposed: text('is_associates_exposed'),
    activityRegions: text('activity_regions').array(),
    hasHeldPublicFunction: text('has_held_public_function'), // legal
    familyHasHeldPublicFunction: text('family_has_held_public_function'),
    closePersonHasHeldPublicFunction: text(
      'close_person_has_held_public_function'
    ),

    // -------------------------
    // DUE DILIGENCE
    // -------------------------
    riskLevel: text('risk_level', {
      enum: ['low', 'medium', 'high']
    }),
    isNamebookChecked: boolean('namebook_checked'),
    namebookDate: text('namebook_date'),
    isOnuListChecked: boolean('onu_list_checked'),
    onuListDate: text('onu_list_date'),
    isWebChecked: boolean('web_checked'),
    webDate: text('web_date'),
    ocicOpinion: text('ocic_opinion', {
      enum: ['favorable', 'unfavorable']
    }),
    ocicComments: text('ocic_comments'),

    // -------------------------
    // Metadata
    // -------------------------
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  table => [
    index('kyc_client_id_idx').on(table.clientId),
    index('kyc_agency_id_idx').on(table.agencyId)
  ]
)

// -------------------------
// RELATED PERSONS TABLE
// -------------------------
export const relatedPersons = pgTable(
  'related_persons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kycId: uuid('kyc_id')
      .references(() => kycDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    fullName: text('full_name').notNull(),
    position: text('position'),
    period: text('period'),
    country: text('country'),
    relationship: text('relationship'),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [index('rp_kyc_id_idx').on(table.kycId)]
)
export const managementPersons = pgTable(
  'management_persons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kycId: uuid('kyc_id')
      .references(() => kycDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    fullName: text('full_name').notNull(),
    position: text('position'),
    documentNumber: text('document_number'),
    dateOfBirth: varchar('date_of_birth', { length: 20 }),
    type: text('type'),
    countryOfBirth: text('country_of_birth'),
    countryOfResidence: text('country_of_residence'),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [index('mp_kyc_id_idx').on(table.kycId)]
)
export const shareholders = pgTable(
  'shareholders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kycId: uuid('kyc_id')
      .references(() => kycDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    fullName: text('full_name').notNull(),
    documentNumber: text('document_number'),
    dateOfBirth: varchar('date_of_birth', { length: 20 }),
    professionalActivity: text('professional_activity'),
    countryOfBirth: text('country_of_birth'),
    countryOfResidence: text('country_of_residence'),
    ownershipPercentage: text('ownership_percentage'),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [index('sh_kyc_id_idx').on(table.kycId)]
)
export const ubos = pgTable(
  'ubos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kycId: uuid('kyc_id')
      .references(() => kycDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    fullName: text('full_name').notNull(),
    nationality: text('nationality'),
    documentNumber: text('document_number'),
    position: text('position'),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [index('ubo_kyc_id_idx').on(table.kycId)]
)

export const kycDocumentFiles = pgTable(
  'kyc_document_files',
  {
    documentId: uuid('document_id')
      .references(() => clientDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    kycDocumentId: uuid('kyc_document_id')
      .references(() => kycDocuments.id, { onDelete: 'cascade' })
      .notNull(),
    linkedAt: timestamp('linked_at').defaultNow().notNull()
  },
  table => [
    primaryKey({ columns: [table.kycDocumentId, table.documentId] }),
    index('document_id_idx').on(table.documentId),
    index('kyc_document_id_idx').on(table.kycDocumentId)
  ]
)

export const insertKycSchema = createInsertSchema(kycDocuments)
export const selectKycSchema = createSelectSchema(kycDocuments)
export const insertRelatedPersonsSchema = createInsertSchema(relatedPersons)
export const selectRelatedPersonsSchema = createSelectSchema(relatedPersons)
export const insertManagementPersonsSchema =
  createInsertSchema(managementPersons)
export const selectManagementPersonsSchema =
  createSelectSchema(managementPersons)
export const insertShareholdersSchema = createInsertSchema(shareholders)
export const selectShareholdersSchema = createSelectSchema(shareholders)
export const insertUbosSchema = createInsertSchema(ubos)
export const selectUbosSchema = createSelectSchema(ubos)
export const insertKycDocumentFilesSchema = createInsertSchema(kycDocumentFiles)
export const selectKycDocumentFilesSchema = createSelectSchema(kycDocumentFiles)
