import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Users,
  Plus,
  Search,
  Filter,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  UserX,
  Trash,
  Eye,
  SearchX,
  Check,
  Copy,
  ArrowLeft
} from 'lucide-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  deleteClient,
  getAllAgencyClientsQueryOptions,
  loadingCreateClientQueryOptions
} from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Client, CreateClient } from '@server/sharedTypes'
import { toast } from 'sonner'

import { ClientDetailsDialog } from '@/components/client-details-dialog'
import { AddClientDialog } from '@/components/add-client-dialog'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

export const Route = createFileRoute('/_authenticated/company/clients')({
  component: ClientsPage
})

function ClientsPage() {
  const [showClientDetailsDialog, setShowClientDetailsDialog] = useState(false)
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const {
    isPending,
    error,
    data: clients
  } = useQuery(getAllAgencyClientsQueryOptions)

  const { data: upcomingClient } = useQuery(loadingCreateClientQueryOptions)

  const newClient = upcomingClient?.client

  const handleOnOpenClientDetailsDialog = (client: Client) => {
    setSelectedClient(client)
    setShowClientDetailsDialog(true)
  }

  if (error) return <div>Error: {error.message}</div>

  const filteredClients = !isPending
    ? clients.filter(client => {
        const matchesSearch =
          client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === 'all' || client.type === filterType
        return matchesSearch && matchesType
      })
    : []

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestió de clients
                </h1>
                <p className="text-gray-600">
                  Gestiona clients, historial KYC i documents carregats
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  className="cursor-pointer"
                  onClick={() => setShowAddClientDialog(true)}
                >
                  <Plus className="size-4 mr-1" />
                  Afegeix client
                </Button>

                <Button variant="outline" asChild>
                  <Link to="/company/dashboard">
                    <ArrowLeft className="size-4 mr-1" /> Torna al tauler
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Filters */}
          <Card className="gap-3 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="size-5 mr-2" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cerca per nom o correu electrònic..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Client Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tots els tipus</SelectItem>
                    <SelectItem value="natural">Persona Física</SelectItem>
                    <SelectItem value="legal">Persona Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Client List */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="size-5 mr-2" /> Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isPending ? (
                  <>
                    <ClientCardSkeleton />
                    <ClientCardSkeleton />
                    <ClientCardSkeleton />
                    <ClientCardSkeleton />
                    <ClientCardSkeleton />
                  </>
                ) : (
                  <>
                    {newClient && <ClientCard client={newClient} />}

                    {clients.length === 0 && !newClient && (
                      <div className="flex flex-col items-center justify-center gap-2 my-10">
                        <UserX className="size-12" color="gray" />
                        <p className="text-gray-500">
                          No s’ha trobat cap client
                        </p>
                      </div>
                    )}

                    {filteredClients.length === 0 && clients.length > 0 && (
                      <div className="flex flex-col items-center justify-center gap-2 my-10">
                        <SearchX className="size-12" color="gray" />
                        <p className="text-gray-500">
                          No hi ha clients que coincideixin amb la teva cerca
                        </p>
                      </div>
                    )}

                    {filteredClients.map(client => (
                      <ClientCard
                        key={client.id}
                        client={client}
                        handleOnOpenClientDetailsDialog={
                          handleOnOpenClientDetailsDialog
                        }
                      />
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddClientDialog
        showAddClientDialog={showAddClientDialog}
        setShowAddClientDialog={setShowAddClientDialog}
      />

      {selectedClient && (
        <ClientDetailsDialog
          selectedClient={selectedClient}
          showClientDetailsDialog={showClientDetailsDialog}
          setShowClientDetailsDialog={setShowClientDetailsDialog}
        />
      )}
    </>
  )
}

const ClientCard = ({
  client,
  handleOnOpenClientDetailsDialog
}: {
  client: Client | CreateClient
  handleOnOpenClientDetailsDialog?: (client: Client) => void
}) => {
  const isOptimistic = !('id' in client)

  return (
    <div
      key={isOptimistic ? client.fullName : client.id}
      className="flex items-center justify-between p-4 border rounded-lg"
    >
      <div className="flex items-center space-x-4">
        <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center">
          {client.type === 'natural' ? (
            <User className="size-6 text-blue-600" />
          ) : (
            <Building className="size-6 text-blue-600" />
          )}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{client.fullName}</h3>
            {isOptimistic ? (
              <Skeleton className="w-68 h-5" />
            ) : (
              <ClientIdBadge clientId={client.id} />
            )}

            <Badge
              variant="outline"
              className={
                client.type === 'natural'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-green-50 text-green-700'
              }
            >
              {client.type === 'natural' ? 'P. Física' : 'P. Jurídica'}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {client.email}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {client.phone}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Registrat:{' '}
              {isOptimistic ? (
                <Skeleton className="w-24 h-5 ml-1" />
              ) : (
                new Date(client.createdAt).toISOString().split('T')[0]
              )}
            </div>
          </div>
          {/* <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-600">Services:</span>
                        {client.serviceTypes.map((service, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div> */}
        </div>
      </div>

      {isOptimistic ? (
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-[99px] rounded-lg" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => handleOnOpenClientDetailsDialog!(client)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Detalls
          </Button>

          <ClientDeleteButton client={client} />
        </div>
      )}
    </div>
  )
}

const ClientDeleteButton = ({ client }: { client: Client }) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: deleteClient,
    onMutate: () => {
      toast.loading(`Eliminant client: ${client.fullName}`)
    },
    onError: () => {
      toast.dismiss()
      toast.error(`No s'ha pogut eliminar el client: ${client.fullName}`)
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success(`Client eliminat correctament: ${client.fullName}`)

      queryClient.setQueryData(
        getAllAgencyClientsQueryOptions.queryKey,
        existingClients =>
          existingClients!.filter(c => c.id !== client.id) ?? []
      )
    }
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={mutation.isPending} variant="outline" size="icon">
          {mutation.isPending ? '...' : <Trash className="size-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Elimina Client - {client.fullName}</DialogTitle>
          <DialogDescription>
            Segur que vols eliminar aquest client?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel·la</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => mutation.mutate({ id: client.id })}
            >
              Elimina
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ClientCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-md h-5 mb-1" />
          <Skeleton className="w-96 h-5 mb-1" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Skeleton className="h-9 w-[99px] rounded-lg" />
        <Skeleton className="size-9 rounded-lg" />
      </div>
    </div>
  )
}

const ClientIdBadge = ({ clientId }: { clientId: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clientId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      <Badge variant="outline" className="text-xs py-1">
        {clientId}
      </Badge>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={handleCopy}
            className="inline-flex items-center justify-center rounded-sm hover:bg-gray-100 size-7 disabled:opacity-100"
            disabled={copied}
          >
            {copied ? (
              <Check className="size-4 text-green-600" />
            ) : (
              <Copy className="size-4 text-gray-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copiar ID</p>
        </TooltipContent>
      </Tooltip>
    </>
  )
}
