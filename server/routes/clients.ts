import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const baseFields = {
  id: z.number(),
  name: z.string(),
  address: z.string(),
  economicActivity: z.string(),
  fundsOrigin: z.string(),
  requestedServices: z.array(z.string()),
  isPEP: z.boolean(),
  pepDetails: z.string().optional(),
  pepRelation: z.string().optional(),
  createdAt: z.string(), // ISO string assumed
  updatedAt: z.string() // ISO string assumed
}

const legalClientSchema = z.object({
  type: z.literal('legal'),
  representatives: z.array(
    z.object({
      name: z.string(),
      role: z.string()
    })
  ),
  beneficiaries: z.array(
    z.object({
      name: z.string(),
      directPercentage: z.number(),
      indirectPercentage: z.number()
    })
  ),
  operatingCountries: z.array(z.string()),
  ...baseFields
})

const naturalClientSchema = z.object({
  type: z.literal('natural'),
  countryOfResidence: z.string(),
  nationalities: z.array(z.string()),
  email: z.string().email(),
  phone: z.string(),
  language: z.string(),
  ...baseFields
})

export const clientSchema = z.discriminatedUnion('type', [
  legalClientSchema,
  naturalClientSchema
])

const createLegalClientSchema = legalClientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

const createNaturalClientSchema = naturalClientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const createClientSchema = z.discriminatedUnion('type', [
  createLegalClientSchema,
  createNaturalClientSchema
])

type Client = z.infer<typeof clientSchema>

const fakeClients: Client[] = [
  {
    id: 1,
    type: 'natural',
    name: 'Alice Smith',
    address: '123 Elm Street, Springfield',
    countryOfResidence: 'USA',
    nationalities: ['USA', 'Canada'],
    email: 'alice@example.com',
    phone: '+1-555-1234',
    language: 'en',
    economicActivity: 'Freelance Designer',
    fundsOrigin: 'Personal savings',
    requestedServices: ['Checking Account', 'Investment Advice'],
    isPEP: false,
    pepDetails: undefined,
    pepRelation: undefined,
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z'
  },
  {
    id: 2,
    type: 'legal',
    name: 'TechCorp LLC',
    address: '456 Industrial Rd, Metropolis',
    representatives: [
      { name: 'John Businessman', role: 'CEO' },
      { name: 'Mary Accountant', role: 'CFO' }
    ],
    beneficiaries: [
      {
        name: 'Global Holdings Ltd.',
        directPercentage: 60,
        indirectPercentage: 0
      },
      {
        name: 'Venture Group Inc.',
        directPercentage: 20,
        indirectPercentage: 20
      }
    ],
    operatingCountries: ['USA', 'Germany', 'Japan'],
    economicActivity: 'Software Development',
    fundsOrigin: 'Private capital and venture funding',
    requestedServices: ['Corporate Account', 'Foreign Exchange'],
    isPEP: true,
    pepDetails: 'Major shareholder is a politically exposed person.',
    pepRelation: 'Shareholder is the brother of a minister',
    createdAt: '2024-01-12T08:45:00Z',
    updatedAt: '2024-06-10T12:00:00Z'
  }
]

export const clientsRoute = new Hono()
  .get('/', c => {
    return c.json({
      clients: fakeClients
    })
  })
  .post('/', zValidator('json', createClientSchema), c => {
    const client = c.req.valid('json')
    fakeClients.push({
      ...client,
      id: fakeClients.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return c.json(client, { status: 201 })
  })
  .get('/:id{[0-9]+}', c => {
    const id = Number.parseInt(c.req.param('id'))
    const client = fakeClients.find(client => client.id === id)

    if (!client) return c.notFound()

    return c.json(client)
  })
  .delete('/:id{[0-9]+}', c => {
    const id = Number.parseInt(c.req.param('id'))
    const client = fakeClients.find(client => client.id === id)

    if (!client) return c.notFound()

    fakeClients.splice(fakeClients.indexOf(client), 1)

    return c.json({ message: 'Client deleted' })
  })
