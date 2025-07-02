import { useEffect, useState } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'

import type { Client } from '@server/routes/clients'
import { api } from '@/lib/api'
import { ClientForm } from '@/components/client-form'

async function getClient(clientId: number) {
  const result = await api.clients[':id{[0-9]+}'].$get({
    param: { id: clientId.toString() }
  })
  if (!result.ok) {
    throw new Error('Failed to fetch clients')
  }
  const data = await result.json()
  return data
}

export const Route = createFileRoute('/client/$clientId')({
  component: Client
})

function Client() {
  const { clientId } = useParams({ strict: false }) as { clientId: number }

  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    if (!clientId) return

    const getData = async () => {
      const client = await getClient(clientId)
      console.log('client', client)
      setClient(client)
    }

    getData()
  }, [clientId])

  return <ClientForm client={client} />
}
