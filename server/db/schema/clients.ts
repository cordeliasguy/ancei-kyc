import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { agencies } from './agencies'

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
    createdAt: timestamp('created_at').defaultNow()
  },
  table => [index('agency_id_idx').on(table.agencyId)]
)
