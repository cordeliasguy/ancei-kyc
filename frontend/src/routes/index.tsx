import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Search,
  FileText,
  Building,
  User,
  LogIn,
  LayoutDashboard
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { getClientById } from '@/lib/api'
import type { Client } from '@server/sharedTypes'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'

const SERVICES = [
  { value: 'corporate_accounting', label: 'Comptabilitat de societats' },
  { value: 'immigration', label: 'Immigració' },
  { value: 'company_formation', label: 'Creació de societats' },
  { value: 'personal_income_tax', label: 'IRPF' },
  { value: 'coworking', label: 'Coworking' }
]

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  const navigate = useNavigate()

  const { data: session, isPending } = authClient.useSession()

  const [clientId, setClientId] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validatedClient, setValidatedClient] = useState<Client | null>(null)
  const [error, setError] = useState('')

  const [showClientDialog, setShowClientDialog] = useState(false)

  const [selectedServices, setSelectedServices] = useState<
    { service: string; frequency: 'One-time' | 'Recurring' | '' }[]
  >([])

  const toggleService = (service: string) => {
    setSelectedServices(prev => {
      // if service already exists, remove it
      if (prev.some(s => s.service === service)) {
        return prev.filter(s => s.service !== service)
      }
      // otherwise add it with empty frequency
      return [...prev, { service, frequency: '' }]
    })
  }

  const updateFrequency = (
    service: string,
    frequency: 'One-time' | 'Recurring'
  ) => {
    setSelectedServices(prev =>
      prev.map(s => (s.service === service ? { ...s, frequency } : s))
    )
  }

  const handleValidateClient = async () => {
    setIsValidating(true)
    setError('')

    try {
      const client = await getClientById({ id: clientId.trim() })

      setValidatedClient(client)
      setShowClientDialog(true)
    } catch (error) {
      setError(
        'Codi de client no trobat. Si us plau, contacta amb el teu consultor.'
      )
      console.error(error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleStartKyc = () => {
    if (!validatedClient || !selectedServices) return

    // Store client session data
    sessionStorage.setItem(
      'clientSession',
      JSON.stringify({
        clientId: validatedClient.id,
        clientName: validatedClient.fullName,
        clientEmail: validatedClient.email,
        clientType: validatedClient.type,
        clientPhone: validatedClient.phone,
        services: selectedServices,
        agencyId: validatedClient.agencyId
      })
    )

    // Redirect to appropriate form
    if (validatedClient.type === 'natural') {
      navigate({ to: '/client/natural' })
    } else {
      navigate({ to: '/client/legal' })
    }
  }

  const handleOnLogin = () => {
    if (session) {
      navigate({ to: '/company/dashboard' })
    } else {
      navigate({ to: '/company/login' })
    }
  }

  const isReady =
    selectedServices.length > 0 &&
    selectedServices.every(s => s.frequency !== '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestió de Documents KYC
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Processament segur i eficient de documents Know Your Customer (KYC)
            per a requisits de compliment normatiu i regulatori
          </p>
        </div>

        {/* Client KYC Section */}
        <Card className="shadow-lg max-w-xl mx-auto py-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 rounded-t-xl">
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-6 h-6 mr-3" />
              Enviar Document KYC
            </CardTitle>
            <CardDescription className="text-blue-100">
              Completa la teva documentació Know Your Customer
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientId">Codi de Client</Label>
                <Input
                  id="clientId"
                  placeholder="Introdueix el teu codi de client"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  El teu codi de client t'ha estat proporcionat pel teu
                  consultor
                </p>
              </div>

              <div>
                <Button
                  onClick={handleValidateClient}
                  disabled={!clientId || isValidating}
                  className="w-full cursor-pointer"
                >
                  {isValidating ? (
                    <>
                      <Spinner className="mr-2" />
                      Validant...
                    </>
                  ) : (
                    <>
                      <Search className="size-4 mr-2" />
                      Validar Codi de Client
                    </>
                  )}
                </Button>

                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Què necessitaràs:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Codi de client vàlid del teu consultor</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Access Portal */}
        <Card className="shadow-md max-w-2xs mx-auto mt-16">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Portal d'Empresa</CardTitle>
            <CardDescription>
              Accés per al personal intern per a la revisió de documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full bg-transparent cursor-pointer"
              onClick={handleOnLogin}
              disabled={isPending}
            >
              {isPending ? (
                <Spinner className="size-4 mr-1" />
              ) : session ? (
                <LayoutDashboard className="size-4 mr-1" />
              ) : (
                <LogIn className="size-4 mr-1" />
              )}
              {isPending
                ? 'Carregant...'
                : session
                  ? 'Tauler'
                  : 'Iniciar sessió'}
            </Button>
          </CardContent>
        </Card>

        {/* Client Validation Dialog */}
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Client Validat Correctament</DialogTitle>
              <DialogDescription>
                Si us plau, selecciona el(s) tipus de servei i la freqüència per
                a la teva sol·licitud KYC
              </DialogDescription>
            </DialogHeader>

            {validatedClient && (
              <div className="space-y-4">
                {/* Client Card */}
                <div className="p-4 bg-green-50 flex items-center justify-between rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="size-10 bg-green-100 rounded-full flex items-center justify-center">
                      {validatedClient.type === 'natural' ? (
                        <User className="size-5 text-green-600" />
                      ) : (
                        <Building className="size-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {validatedClient.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {validatedClient.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      validatedClient.type === 'natural'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-blue-50 text-blue-700'
                    }
                  >
                    {validatedClient.type === 'natural'
                      ? 'Persona Física'
                      : 'Persona Jurídica'}
                  </Badge>
                </div>

                {/* Service Selection */}
                <div className="w-full space-y-3">
                  <Label>Tipus de Servei(s)</Label>
                  <div className="flex flex-col gap-3 rounded-md border p-3">
                    {SERVICES.map(service => {
                      const selected = selectedServices.find(
                        s => s.service === service.value
                      )
                      return (
                        <div
                          key={service.value}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={service.value}
                              checked={!!selected}
                              onCheckedChange={() =>
                                toggleService(service.value)
                              }
                            />
                            <label
                              htmlFor={service.value}
                              className="text-sm leading-none"
                            >
                              {service.label}
                            </label>
                          </div>

                          {selected && (
                            <Select
                              value={selected.frequency}
                              onValueChange={val =>
                                updateFrequency(
                                  service.value,
                                  val as 'One-time' | 'Recurring'
                                )
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Freqüència" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="One-time">Única</SelectItem>
                                <SelectItem value="Recurring">
                                  Recurrent
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setShowClientDialog(false)}
                  >
                    Cancel·la
                  </Button>
                  <Button onClick={handleStartKyc} disabled={!isReady}>
                    Iniciar Procés KYC
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
