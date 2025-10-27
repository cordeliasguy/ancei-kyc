import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getAgencyByIdQueryOptions } from '@/lib/api'
import { toast } from 'sonner'
import type { KYCSession } from '@/lib/types'
import { NaturalClientForm } from '@/components/natural-client-form'

export const Route = createFileRoute('/client/natural')({
  component: NaturalPersonKYCForm
})

function NaturalPersonKYCForm() {
  const navigate = useNavigate()

  const [kycSession, setKycSession] = useState<KYCSession | null>(null)

  const { data: agency, isPending } = useQuery({
    ...getAgencyByIdQueryOptions(kycSession?.agencyId || ''),
    enabled: !!kycSession?.agencyId
  })

  useEffect(() => {
    // Load KYC session data
    const sessionData = sessionStorage.getItem('clientSession')

    if (sessionData) {
      const session = JSON.parse(sessionData)
      setKycSession(session)
    } else {
      toast.error(
        "No s'ha trobat una sessió KYC vàlida. Si us plau, torneu a començar."
      )
      navigate({ to: '/' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!kycSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">Carregant sessió...</h2>
            <p className="text-gray-600">
              Si us plau, espereu mentre validem la vostra sessió KYC.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3 ">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/' })}
            >
              <ArrowLeft className="size-4 mr-1" />
              Tornar
            </Button>
            <div className="w-full text-center">
              <h1 className="text-2xl font-bold text-gray-900 pr-[89px]">
                Formulari KYC - Persona Física
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information Banner */}
      <div className="bg-blue-50 border-b">
        <div className="flex justify-center container mx-auto px-4 py-3 space-x-2 text-sm text-gray-600">
          <span className="font-medium ">{kycSession.clientName}</span>
          <span>•</span>
          <span>{isPending ? 'Loading...' : agency?.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <NaturalClientForm kycSession={kycSession} />
        </div>
      </div>
    </div>
  )
}
