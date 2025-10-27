import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { agencies } from './agencies'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm/relations'

export const clients = pgTable(
  'clients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id')
      .notNull()
      .references(() => agencies.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['natural', 'legal'] }).notNull(),
    fullName: text('full_name').notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [index('agency_id_idx').on(table.agencyId)]
)

export const clientDocuments = pgTable(
  'client_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    url: text('url').notNull(),
    type: text('type').notNull(),
    size: integer('size').notNull(),
    isSignature: boolean('is_signature').default(false).notNull(),
    expiresAt: date('expires_at').notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull()
  },
  table => [index('client_id_idx').on(table.clientId)]
)

export const clientsRelations = relations(clients, ({ many }) => ({
  documents: many(clientDocuments)
}))

export const clientDocumentsRelations = relations(
  clientDocuments,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientDocuments.clientId],
      references: [clients.id]
    })
  })
)

export const insertClientsSchema = createInsertSchema(clients)
export const selectClientsSchema = createSelectSchema(clients)
export const patchClientSchema = createInsertSchema(clients)
export const insertClientDocumentsSchema = createInsertSchema(clientDocuments)
export const selectClientDocumentsSchema = createSelectSchema(clientDocuments)
