import KYCPDFGenerator from '@/components/pdf-generator'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { Client } from '@server/routes/clients'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

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

export const Route = createFileRoute('/preview/$clientId')({
  component: Preview
})

function Preview() {
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

  if (!client) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" className="mb-4 bg-transparent" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">
            PDF Preview & Export
          </h1>
        </div>

        <KYCPDFGenerator
          formData={client as Client}
          onGeneratePDF={() => console.log('PDF Generated')}
        />
      </div>
    </div>
  )
}
