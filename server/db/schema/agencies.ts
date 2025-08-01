import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const agencies = pgTable('agencies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})
