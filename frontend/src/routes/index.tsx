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
  Clock,
  LogIn,
  LayoutDashboard
} from 'lucide-react'
// import { api } from '@/lib/api'
// import { useQuery } from '@tanstack/react-query'
// import type { Agency } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'

interface Client {
  code: string
  name: string
  email: string
  type: 'natural' | 'legal'
  status: 'active' | 'inactive'
  lastKyc?: string
  kycHistory: Array<{
    id: string
    date: string
    service: string
    status: string
  }>
}

export const Route = createFileRoute('/')({
  component: Index
})

// async function getAllAgencies() {
//   const res = await api.agencies.$get()

//   if (!res.ok) throw new Error('Failed to fetch agencies')

//   const data = await res.json()
//   return data.agencies
// }

// async function getAgencyById({ id }: { id: string }) {
//   const res = await api.agencies[':id'].$get({ param: { id } })

//   if (!res.ok) throw new Error('Failed to fetch agency')

//   const data = (await res.json()) as { agency: Agency }
//   return data.agency
// }

function Index() {
  const navigate = useNavigate()

  const { data: session } = useAuth()

  // const { isPending, error, data } = useQuery({
  //   queryKey: ['agency'],
  //   queryFn: () => getAgencyById({ id: '0cdc23ef-0673-493d-88f3-ca974ceb127c' })
  // })

  const [clientCode, setClientCode] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [serviceFrequency, setServiceFrequency] = useState('')
  const [validatedClient, setValidatedClient] = useState<Client | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)

  // Mock client database
  const mockClients: Record<string, Client> = {
    'CLI-001': {
      code: 'CLI-001',
      name: 'Maria García López',
      email: 'maria.garcia@email.com',
      type: 'natural',
      status: 'active',
      lastKyc: '2024-01-15',
      kycHistory: [
        {
          id: 'KYC-001',
          date: '2024-01-15',
          service: 'Tax Advisory',
          status: 'pending_review'
        }
      ]
    },
    'CLI-002': {
      code: 'CLI-002',
      name: 'Consultoria Tech SL',
      email: 'info@consultoriatech.com',
      type: 'legal',
      status: 'active',
      lastKyc: '2024-01-13',
      kycHistory: [
        {
          id: 'KYC-003',
          date: '2024-01-13',
          service: 'Business Setup',
          status: 'compliance_review'
        }
      ]
    },
    'CLI-003': {
      code: 'CLI-003',
      name: 'Joan Martínez Vila',
      email: 'joan.martinez@email.com',
      type: 'natural',
      status: 'active',
      lastKyc: '2024-01-14',
      kycHistory: [
        {
          id: 'KYC-002',
          date: '2024-01-14',
          service: 'Legal Consultation',
          status: 'business_review'
        }
      ]
    }
  }

  const handleValidateClient = () => {
    setIsValidating(true)

    // Simulate API call
    setTimeout(() => {
      const client = mockClients[clientCode.toUpperCase()]
      if (client && client.status === 'active') {
        setValidatedClient(client)
        setShowClientDialog(true)
      } else {
        alert(
          'Client code not found or inactive. Please contact your consultant.'
        )
      }
      setIsValidating(false)
    }, 1000)
  }

  const handleStartKyc = () => {
    if (!validatedClient || !serviceType) return

    // Store client session data
    sessionStorage.setItem(
      'clientSession',
      JSON.stringify({
        clientCode: validatedClient.code,
        clientName: validatedClient.name,
        clientEmail: validatedClient.email,
        clientType: validatedClient.type,
        serviceType: serviceType,
        consultancy: 'Ancei Consultoria Estratègica Internacional SA'
      })
    )

    // Redirect to appropriate form
    if (validatedClient.type === 'natural') {
      navigate({ to: '/client/natural' })
    } else {
      navigate({ to: '/client/legal' })
    }
  }

  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case 'pending_review':
  //       return (
  //         <Badge variant="secondary">
  //           <Clock className="w-3 h-3 mr-1" />
  //           Pending
  //         </Badge>
  //       )
  //     case 'business_review':
  //       return (
  //         <Badge variant="default" className="bg-blue-600">
  //           Business Review
  //         </Badge>
  //       )
  //     case 'compliance_review':
  //       return (
  //         <Badge variant="default" className="bg-orange-600">
  //           Compliance
  //         </Badge>
  //       )
  //     case 'sent_to_government':
  //       return (
  //         <Badge variant="default" className="bg-indigo-600">
  //           Sent to Gov
  //         </Badge>
  //       )
  //     case 'approved':
  //       return (
  //         <Badge variant="default" className="bg-green-600">
  //           <CheckCircle className="w-3 h-3 mr-1" />
  //           Approved
  //         </Badge>
  //       )
  //     default:
  //       return <Badge variant="secondary">Unknown</Badge>
  //   }
  // }

  // if (error) return 'An error has occurred: ' + error.message

  // if (isPending) return 'Loading...'

  // console.log('DATA: ', data)

  const handleOnLogin = () => {
    if (session) {
      navigate({ to: '/company/dashboard' })
    } else {
      navigate({ to: '/company/login' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            KYC Document Management System
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Secure and efficient Know Your Customer (KYC) document processing
            for compliance and regulatory requirements
          </p>
        </div>

        {/* Client KYC Section */}
        <Card className="shadow-lg max-w-xl mx-auto py-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 rounded-t-xl">
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-6 h-6 mr-3" />
              Submit KYC Document
            </CardTitle>
            <CardDescription className="text-blue-100">
              Complete your Know Your Customer documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientCode">Client Code</Label>
                <Input
                  id="clientCode"
                  placeholder="Enter your client code (e.g., CLI-001)"
                  value={clientCode}
                  onChange={e => setClientCode(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your client code was provided by your consultant
                </p>
              </div>

              <Button
                onClick={handleValidateClient}
                disabled={!clientCode || isValidating}
                className="w-full cursor-pointer"
              >
                {isValidating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Validate Client Code
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">What you'll need:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Valid client code from your consultant</li>
                {/* <li>• Personal identification documents</li>
                <li>• Proof of address</li>
                <li>• Additional documents based on service type</li> */}
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
            <CardTitle>Company Portal</CardTitle>
            <CardDescription>
              Internal staff access for document review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full bg-transparent cursor-pointer"
              onClick={handleOnLogin}
            >
              {session ? (
                <LayoutDashboard className="size-4 mr-1" />
              ) : (
                <LogIn className="size-4 mr-1" />
              )}
              {session ? 'Dashboard' : 'Login'}
            </Button>
          </CardContent>
        </Card>

        {/* Client Validation Dialog */}
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Client Validated Successfully</DialogTitle>
              <DialogDescription>
                Please select the service type for your KYC submission
              </DialogDescription>
            </DialogHeader>
            {validatedClient && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      {validatedClient.type === 'natural' ? (
                        <User className="w-5 h-5 text-green-600" />
                      ) : (
                        <Building className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{validatedClient.name}</p>
                      <p className="text-sm text-gray-600">
                        {validatedClient.code}
                      </p>
                      <p className="text-sm text-gray-600">
                        {validatedClient.type === 'natural'
                          ? 'Natural Person'
                          : 'Legal Entity'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row w-full justify-evenly gap-3">
                  <div className="w-full">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tax Advisory">
                          Tax Advisory
                        </SelectItem>
                        <SelectItem value="Legal Consultation">
                          Legal Consultation
                        </SelectItem>
                        <SelectItem value="Business Setup">
                          Business Setup
                        </SelectItem>
                        <SelectItem value="Investment Advisory">
                          Investment Advisory
                        </SelectItem>
                        <SelectItem value="HR Services">HR Services</SelectItem>
                        <SelectItem value="Accounting">Accounting</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full">
                    <Label htmlFor="serviceFrequency">Service Frequency</Label>
                    <Select
                      value={serviceFrequency}
                      onValueChange={setServiceFrequency}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="One-time">One-time</SelectItem>
                        <SelectItem value="Recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setShowClientDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleStartKyc} disabled={!serviceType}>
                    Start KYC Process
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
