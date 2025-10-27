import type { ApiRoutes } from '@server/app'
import { hc } from 'hono/client'
import { queryOptions } from '@tanstack/react-query'
import type {
  Agency,
  Client,
  CreateClient,
  CreateClientDocument,
  CreateKycDocument,
  CreateManagementPerson,
  CreateRelatedPerson,
  CreateShareholder,
  CreateUbo,
  CreateUser,
  KycDocument,
  UpdateClient,
  UpdateUser
} from '@server/sharedTypes'

const client = hc<ApiRoutes>('/')

export const api = client.api

export const getUserQueryOptions = queryOptions({
  queryKey: ['get-current-user'],
  queryFn: getCurrentUser,
  staleTime: Infinity
})

async function getCurrentUser() {
  const res = await api.me.$get()

  if (!res.ok) throw new Error('Server error')

  const data = await res.json()
  return data
}

export const getAgencyUsersQueryOptions = queryOptions({
  queryKey: ['get-agency-users'],
  queryFn: getAgencyUsers,
  staleTime: 1000 * 60 * 5 // 5 minutes
})

async function getAgencyUsers() {
  const res = await api.users.$get()

  if (!res.ok) throw new Error('Server error')

  const data = await res.json()
  return data.users
}

export const getAllKycDocumentsFromAgencyQueryOptions = queryOptions({
  queryKey: ['get-all-kyc-documents-from-agency'],
  queryFn: getAllKycDocumentsFromAgency,
  staleTime: 1000 * 60 * 5 // 5 minutes
})

async function getAllKycDocumentsFromAgency() {
  const res = await api.kyc.$get()

  if (!res.ok) throw new Error('Failed to fetch kyc documents from agency')

  const data = await res.json()
  return data.kycDocuments
}

export const getAllAgencyClientsQueryOptions = queryOptions({
  queryKey: ['get-all-agency-clients'],
  queryFn: getAllAgencyClients,
  staleTime: 1000 * 60 * 5 // 5 minutes
})

async function getAllAgencyClients() {
  const res = await api.clients.$get()

  if (!res.ok) throw new Error('Failed to fetch clients from agency')

  const data = await res.json()
  return data.clients
}

export const getAllAgencyClientsWithDocumentsQueryOptions = queryOptions({
  queryKey: ['get-all-agency-clients-with-documents'],
  queryFn: getAllAgencyClientsWithDocuments,
  staleTime: 1000 * 60 * 5 // 5 minutes
})

async function getAllAgencyClientsWithDocuments() {
  const res = await api.clients['with-documents'].$get()

  if (!res.ok) throw new Error('Failed to fetch clients from agency')

  const data = await res.json()
  return data.clients
}

export async function createClient({ value }: { value: CreateClient }) {
  const res = await api.clients.$post({ json: value })

  if (!res.ok) throw new Error('Failed to create client')

  const newClient = await res.json()
  return newClient
}

export const loadingCreateClientQueryOptions = queryOptions<{
  client?: CreateClient
}>({
  queryKey: ['loading-create-client'],
  queryFn: async () => {
    return {}
  },
  staleTime: Infinity
})

export async function deleteClient({ id }: { id: string }) {
  const res = await api.clients[':id{[0-9a-fA-F-]{36}}'].$delete({
    param: { id }
  })

  if (!res.ok) {
    throw new Error('Failed to delete client')
  }
}

export async function uploadClientDocument({
  clientId,
  value
}: {
  clientId: string
  value: CreateClientDocument
}) {
  const res = await api.clients[':clientId{[0-9a-fA-F-]{36}}'].document.$post({
    param: { clientId },
    json: value
  })

  if (!res.ok) throw new Error('Failed to upload client document')

  const newDocument = await res.json()
  return newDocument
}

export async function linkClientDocument({
  documentId,
  kycId
}: {
  documentId: string
  kycId: string
}) {
  const res = await api.clients[':documentId{[0-9a-fA-F-]{36}}'][
    ':kycId{[0-9a-fA-F-]{36}}'
  ].link.$post({
    param: { documentId, kycId }
  })

  if (!res.ok) throw new Error('Failed to create document link with kyc')

  const newLinkedDocument = await res.json()
  return newLinkedDocument
}

export async function unlinkClientDocument({
  documentId,
  kycId
}: {
  documentId: string
  kycId: string
}) {
  const res = await api.clients[':documentId{[0-9a-fA-F-]{36}}'][
    ':kycId{[0-9a-fA-F-]{36}}'
  ].unlink.$delete({
    param: { documentId, kycId }
  })

  if (!res.ok) throw new Error('Failed to unlink document with kyc')

  const newLinkedDocument = await res.json()
  return newLinkedDocument
}

export const getAllClientKycsQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ['get-all-client-kycs', clientId],
    queryFn: async () => {
      const res = await api.clients[':clientId{[0-9a-fA-F-]{36}}'].kycs.$get({
        param: { clientId }
      })

      if (!res.ok) throw new Error('Failed to fetch client kycs')

      const data = await res.json()
      return data.kycs
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export async function deleteClientDocument({
  clientId,
  documentId
}: {
  clientId: string
  documentId: string
}) {
  const res = await api.clients[':clientId{[0-9a-fA-F-]{36}}'].document[
    ':documentId{[0-9a-fA-F-]{36}}'
  ].$delete({
    param: { clientId, documentId }
  })

  if (!res.ok) throw new Error('Failed to delete client document')

  const newDocument = await res.json()
  return newDocument
}

export async function updateClientInfo({
  id,
  value
}: {
  id: string
  value: UpdateClient
}) {
  const res = await api.clients[':id{[0-9a-fA-F-]{36}}'].$patch({
    param: { id },
    json: value
  })

  if (!res.ok) throw new Error('Failed to update client')

  const updatedClient = await res.json()
  return updatedClient
}

export async function getClientById({ id }: { id: string }) {
  const res = await api.clients[':id{[0-9a-fA-F-]{36}}'].$get({
    param: { id }
  })

  if (!res.ok) throw new Error('Failed to fetch client')

  const data = (await res.json()) as { client: Client }
  return data.client
}

async function getKycById({ id }: { id: string }) {
  const res = await api.kyc[':id{[0-9a-fA-F-]{36}}'].$get({
    param: { id }
  })

  if (!res.ok) throw new Error('Failed to fetch kyc')

  const data = (await res.json()) as { kyc: KycDocument }
  return data.kyc
}

export const getKycByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['get-kyc-by-id', id],
    queryFn: () => getKycById({ id }),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const getAgencyByIdQueryOptions = (agencyId: string) =>
  queryOptions({
    queryKey: ['get-agency-by-id', agencyId],
    queryFn: () => getAgencyById({ id: agencyId }),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export async function getAgencyById({ id }: { id: string }) {
  const res = await api.agencies[':id{[0-9a-fA-F-]{36}}'].$get({
    param: { id }
  })

  if (!res.ok) throw new Error('Failed to fetch agency')

  const data = (await res.json()) as { agency: Agency }
  return data.agency
}

export async function createManagementPersons({
  value
}: {
  value: CreateManagementPerson[]
}) {
  const res = await api.kyc['management-persons'].$post({ json: value })

  if (!res.ok) throw new Error('Failed to create management person/s')

  const data = await res.json()
  return data
}

export async function createShareholders({
  value
}: {
  value: CreateShareholder[]
}) {
  const res = await api.kyc['shareholders'].$post({ json: value })

  if (!res.ok) throw new Error('Failed to create shareholder/s')

  const data = await res.json()
  return data
}

export async function createUbos({ value }: { value: CreateUbo[] }) {
  const res = await api.kyc['ubos'].$post({ json: value })

  if (!res.ok) throw new Error('Failed to create ubo/s')

  const data = await res.json()
  return data
}

export const getKycDocumentFilesByIdQueryOptions = (kycId: string) =>
  queryOptions({
    queryKey: ['get-kyc-document-files-by-id', kycId],
    queryFn: async () => {
      const res = await api.kyc[':id{[0-9a-fA-F-]{36}}'].documents.$get({
        param: { id: kycId }
      })

      if (!res.ok) throw new Error('Failed to fetch kyc document files')

      const data = await res.json()
      return data.documents
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const getClientDocumentsByIdQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ['get-client-documents-by-id', clientId],
    queryFn: async () => {
      const res = await api.clients[
        ':clientId{[0-9a-fA-F-]{36}}'
      ].documents.$get({
        param: { clientId }
      })

      if (!res.ok) throw new Error('Failed to fetch client documents')

      const data = await res.json()
      return data.documents
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export async function createKycDocument({
  value
}: {
  value: CreateKycDocument
}) {
  const res = await api.kyc.$post({ json: value })

  if (!res.ok) throw new Error('Failed to create KYC document')

  const data = await res.json()
  return data
}

export const updateKycDocument = async ({
  value,
  kycId
}: {
  value: CreateKycDocument
  kycId: string
}) => {
  const res = await api.kyc[':id{[0-9a-fA-F-]{36}}'].$patch({
    param: { id: kycId },
    json: value
  })

  if (!res.ok) throw new Error('Failed to update KYC document')

  const data = (await res.json()) as KycDocument
  return data
}

export async function createRelatedPersons({
  value
}: {
  value: CreateRelatedPerson[]
}) {
  const res = await api.kyc['related-persons'].$post({ json: value })

  if (!res.ok) throw new Error('Failed to create related person/s')

  const data = await res.json()
  return data
}

export const getKycRelatedPersonsByIdQueryOptions = ({
  kycId
}: {
  kycId: string
}) =>
  queryOptions({
    queryKey: ['get-kyc-related-persons-by-id', kycId],
    queryFn: async () => {
      const res = await api.kyc[':id{[0-9a-fA-F-]{36}}'][
        'related-persons'
      ].$get({
        param: { id: kycId }
      })

      if (!res.ok) throw new Error('Failed to fetch kyc related persons')

      const data = await res.json()
      return data.relatedPersons
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const getKycManagementMembersByIdQueryOptions = ({
  kycId
}: {
  kycId: string
}) =>
  queryOptions({
    queryKey: ['get-kyc-management-members-by-id', kycId],
    queryFn: async () => {
      const res = await api.kyc[':id{[0-9a-fA-F-]{36}}'][
        'management-members'
      ].$get({
        param: { id: kycId }
      })

      if (!res.ok) throw new Error('Failed to fetch kyc management members')

      const data = await res.json()
      return data.managementMembers
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const getKycShareholdersByIdQueryOptions = ({
  kycId
}: {
  kycId: string
}) =>
  queryOptions({
    queryKey: ['get-kyc-shareholders-by-id', kycId],
    queryFn: async () => {
      const res = await api.kyc[':id{[0-9a-fA-F-]{36}}']['shareholders'].$get({
        param: { id: kycId }
      })

      if (!res.ok) throw new Error('Failed to fetch kyc shareholders')

      const data = await res.json()
      return data.shareholders
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const getKycUbosByIdQueryOptions = ({ kycId }: { kycId: string }) =>
  queryOptions({
    queryKey: ['get-kyc-ubos-by-id', kycId],
    queryFn: async () => {
      const res = await api.kyc[':id{[0-9a-fA-F-]{36}}']['ubos'].$get({
        param: { id: kycId }
      })

      if (!res.ok) throw new Error('Failed to fetch kyc ubos')

      const data = await res.json()
      return data.ubos
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const getDocumentLinkedKycsQueryOptions = (documentId: string) =>
  queryOptions({
    queryKey: ['get-document-linked-kycs', documentId],
    queryFn: async () => {
      const res = await api.clients[
        ':documentId{[0-9a-fA-F-]{36}}'
      ].linked.$get({
        param: { documentId }
      })

      if (!res.ok) throw new Error('Failed to fetch linked kycs')

      const data = await res.json()
      return data.linkedDocuments
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const getExpiringDocumentsQueryOptions = () =>
  queryOptions({
    queryKey: ['get-expiring-documents'],
    queryFn: async () => {
      const res = await api.agencies['expiring-documents'].$get()

      if (!res.ok) throw new Error('Failed to fetch expiring documents')

      const data = await res.json()
      return data.documents
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

export const createUser = async ({ value }: { value: CreateUser }) => {
  const res = await api.users.$post({ json: value })

  if (!res.ok) throw new Error('Failed to create user')

  const data = await res.json()
  return data.user
}

export const deleteUserById = async ({ id }: { id: string }) => {
  const res = await api.users[':id'].$delete({
    param: { id }
  })

  if (!res.ok) throw new Error('Failed to delete user')

  const data = await res.json()
  return data.user
}

export const updateUser = async ({
  id,
  value
}: {
  id: string
  value: UpdateUser
}) => {
  const res = await api.users[':id'].$patch({
    param: { id },
    json: value
  })

  if (!res.ok) throw new Error('Failed to update user')

  const data = await res.json()
  return data.user
}
