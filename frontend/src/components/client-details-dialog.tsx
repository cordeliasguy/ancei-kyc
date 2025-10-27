import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  Download,
  FileText,
  Trash2,
  Upload,
  Eye,
  AlertCircleIcon,
  Check,
  Clock
} from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import type { Client, ClientDocument, KycStatus } from '@server/sharedTypes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteClientDocument,
  getAllAgencyClientsQueryOptions,
  getClientDocumentsByIdQueryOptions,
  getAllClientKycsQueryOptions,
  updateClientInfo,
  getDocumentLinkedKycsQueryOptions
} from '@/lib/api'
import { toast } from 'sonner'
import { UploadClientDocumentDialog } from './upload-client-document-dialog'
import { InputContainer } from './input-container'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'
import { getServiceLabel } from '@/lib/utils'
import { formatFileSize, getFileIcon } from '@/utils'
import { Spinner } from './ui/spinner'
import { useNavigate } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Badge } from './ui/badge'

type TabValue = 'info' | 'kyc' | 'documents'

export const ClientDetailsDialog = ({
  selectedClient,
  showClientDetailsDialog,
  setShowClientDetailsDialog
}: {
  selectedClient: Client
  showClientDetailsDialog: boolean
  setShowClientDetailsDialog: Dispatch<SetStateAction<boolean>>
}) => {
  const [tabValue, setTabValue] = useState<TabValue>('info')

  return (
    <Dialog
      open={showClientDetailsDialog}
      onOpenChange={open => {
        setShowClientDetailsDialog(open)
        if (!open) setTabValue('info')
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[80vh] h-2/3 flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Detalls del client - {selectedClient.fullName}
          </DialogTitle>
          <DialogDescription>
            Informació completa del client, historial KYC i gestió de documents
          </DialogDescription>
        </DialogHeader>

        {selectedClient && (
          <Tabs
            value={tabValue}
            onValueChange={value => setTabValue(value as TabValue)}
            className="size-full overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informació del client</TabsTrigger>
              <TabsTrigger value="kyc">Historial KYC</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <InfoTab client={selectedClient} />
            <KycHistoryTab
              client={selectedClient}
              isKycHistoryTab={tabValue === 'kyc'}
            />
            <DocumentsTab
              client={selectedClient}
              isDocumentsTab={tabValue === 'documents'}
            />
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

const InfoTab = ({ client }: { client: Client }) => {
  const queryClient = useQueryClient()

  const [initialFormData, setInitialFormData] = useState({
    fullName: client.fullName,
    phone: client.phone,
    email: client.email
  })
  const [formData, setFormData] = useState(initialFormData)

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOnSubmit = async () => {
    setIsLoading(true)

    const existingClients = await queryClient.ensureQueryData(
      getAllAgencyClientsQueryOptions
    )

    try {
      const updatedClient = await updateClientInfo({
        id: client.id,
        value: formData
      })

      const updatedClients = existingClients.map(c =>
        c.id === updatedClient.id ? updatedClient : c
      )

      queryClient.setQueryData(
        getAllAgencyClientsQueryOptions.queryKey,
        updatedClients
      )

      const updatedClientFormValues = {
        fullName: updatedClient.fullName,
        phone: updatedClient.phone,
        email: updatedClient.email
      }

      setFormData(updatedClientFormValues)
      setInitialFormData(updatedClientFormValues)

      toast.success(
        `Client actualitzat correctament: ${updatedClient.fullName}`
      )
    } catch (error) {
      console.error(error)
      toast.error(`No s'ha pogut actualitzar el client: ${client.fullName}`)
    } finally {
      setIsLoading(false)
    }
  }

  const noChangesMade =
    formData.fullName === initialFormData.fullName &&
    formData.email === initialFormData.email &&
    formData.phone === initialFormData.phone

  return (
    <TabsContent value="info" className="space-y-4">
      <div className="grid grid-cols-2 gap-4 px-2 mt-2">
        <InputContainer>
          <Label htmlFor="fullName">Nom*</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={e => handleInputChange('fullName', e.target.value)}
            placeholder="Nom complet"
          />
        </InputContainer>

        <InputContainer>
          <Label htmlFor="clientId">Codi del client</Label>
          <Input id="clientId" value={client.id} disabled />
        </InputContainer>

        <InputContainer>
          <Label htmlFor="email">Correu electrònic*</Label>
          <Input
            id="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            placeholder="Correu electrònic"
          />
        </InputContainer>

        <InputContainer>
          <Label htmlFor="phone">Telèfon*</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={e => handleInputChange('phone', e.target.value)}
            placeholder="Telèfon"
          />
        </InputContainer>

        <InputContainer>
          <Label htmlFor="type">Tipus</Label>
          <Input
            id="type"
            value={client.type === 'natural' ? 'P. Física' : 'P.Jurídica'}
            disabled
          />
        </InputContainer>

        <InputContainer>
          <Label htmlFor="registration_date">Data de registre</Label>
          <Input
            id="registration_date"
            value={new Date(client.createdAt).toISOString().split('T')[0]}
            disabled
          />
        </InputContainer>
      </div>

      <div className="flex justify-end px-2">
        <Button disabled={noChangesMade || isLoading} onClick={handleOnSubmit}>
          {isLoading ? (
            <>
              <Spinner />
              S'estan desant els canvis...
            </>
          ) : (
            'Desa els canvis'
          )}
        </Button>
      </div>
    </TabsContent>
  )
}

const KycHistoryTab = ({
  client,
  isKycHistoryTab
}: {
  client: Client
  isKycHistoryTab: boolean
}) => {
  const navigate = useNavigate()

  const {
    data: kycs,
    error,
    isPending
  } = useQuery({
    ...getAllClientKycsQueryOptions(client.id),
    enabled: isKycHistoryTab
  })

  const getStatusBadgeColor = (status?: KycStatus) => {
    switch (status) {
      case 'submitted':
        return 'bg-sky-100 border-sky-200 text-sky-800'
      case 'responsible_reviewed':
        return 'bg-blue-100 border-blue-200 text-blue-800'
      case 'compliance_reviewed':
        return 'bg-amber-100 border-amber-200 text-amber-800'
      default:
        return 'bg-green-100 border-green-200 text-green-800'
    }
  }

  const getStatusBadgeLabel = (status?: KycStatus) => {
    switch (status) {
      case 'submitted':
        return 'Enviat'
      case 'responsible_reviewed':
        return 'Revisat per responsable'
      case 'compliance_reviewed':
        return 'Revisat per compliance'
      default:
        return 'Completat'
    }
  }

  if (error) return <div>Error: {error.message}</div>

  return (
    <TabsContent
      value="kyc"
      className="flex flex-col flex-1 overflow-hidden gap-4"
    >
      <h3 className="text-lg font-semibold mt-2">
        Kycs del client ({isPending ? '...' : kycs.length})
      </h3>

      <div className="flex flex-col flex-1 overflow-y-auto gap-3 ">
        {isPending ? (
          <>
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </>
        ) : (
          <>
            {kycs.length === 0 && (
              <div className="flex flex-col flex-1 items-center justify-center text-gray-500 mb-14">
                <Upload className="size-12 mx-auto mb-4 opacity-50" />
                <p>No s’ha pujat cap KYC encara</p>
                <p className="text-sm">
                  Aquest client no ha enviat cap KYC de moment
                </p>
              </div>
            )}

            {kycs.map(kyc => (
              <div
                key={kyc.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 "
              >
                <div className="flex space-x-3">
                  <div className="pt-1">
                    <FileText className="size-4 text-blue-600" />
                  </div>

                  <div>
                    <p className="font-medium">
                      KYC •{' '}
                      {new Date(kyc.createdAt).toISOString().split('T')[0]}
                    </p>

                    <span className="text-sm text-gray-600">
                      Servei/s: {kyc.services.map(getServiceLabel).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    className={`rounded-full ${getStatusBadgeColor(kyc.status)}`}
                  >
                    {kyc.status === 'completed' ? <Check /> : <Clock />}
                    {getStatusBadgeLabel(kyc.status)}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => navigate({ to: `/company/view/${kyc.id}` })}
                  >
                    <Eye className="size-4" />
                    Veure
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </TabsContent>
  )
}

const DocumentsTab = ({
  client,
  isDocumentsTab
}: {
  client: Client
  isDocumentsTab: boolean
}) => {
  const [showDocumentUploadDialog, setShowDocumentUploadDialog] =
    useState(false)

  const [isDownloading, setIsDownloading] = useState(false)

  const {
    data: documents,
    error,
    isPending
  } = useQuery({
    ...getClientDocumentsByIdQueryOptions(client.id),
    enabled: isDocumentsTab
  })

  const filteredDocuments = documents?.filter(doc => !doc.isSignature) ?? []

  const downloadFile = async (url: string, filename?: string) => {
    setIsDownloading(true)

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch file')

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || url.split('/').pop() || 'download'
      document.body.appendChild(link)
      link.click()

      // cleanup
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setIsDownloading(false)
    }
  }

  if (error) return <div>Error: {error.message}</div>

  return (
    <>
      <TabsContent
        value="documents"
        className="flex flex-col flex-1 overflow-hidden gap-4"
      >
        <div className="flex justify-between items-center mt-2">
          <h3 className="text-lg font-semibold">
            Documents del client ({isPending ? '...' : filteredDocuments.length}
            )
          </h3>

          <Button onClick={() => setShowDocumentUploadDialog(true)}>
            <Upload className="size-4 mr-1" />
            Pujar nou
          </Button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto gap-3">
          {isPending ? (
            <>
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
              <DocumentCardSkeleton />
            </>
          ) : (
            <>
              {filteredDocuments.length === 0 && (
                <div className="flex flex-col flex-1 items-center justify-center text-gray-500 mb-14">
                  <Upload className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Encara no s’ha pujat cap document</p>
                  <p className="text-sm">
                    Puja documents per ajudar en les revisions de compliment
                  </p>
                </div>
              )}

              {filteredDocuments.map(document => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 "
                >
                  <div className="flex space-x-3">
                    <div className="pt-1">{getFileIcon(document.type)}</div>

                    <div>
                      <p className="font-medium">{document.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{formatFileSize(document.size)}</span>
                        <span>•</span>
                        <span>
                          Pujat:{' '}
                          {
                            new Date(document.uploadedAt)
                              .toISOString()
                              .split('T')[0]
                          }
                        </span>

                        <span>•</span>
                        <span>Caduca: {document.expiresAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => downloadFile(document.url, document.name)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <Spinner className="size-4" />
                          Descarregant...
                        </>
                      ) : (
                        <>
                          <Download className="size-4" />
                          Descarregar
                        </>
                      )}
                    </Button>

                    <ClientDocumentDeleteButton
                      clientId={client.id}
                      document={document}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </TabsContent>

      <UploadClientDocumentDialog
        uploadingClient={client}
        showDocumentUploadDialog={showDocumentUploadDialog}
        setShowDocumentUploadDialog={setShowDocumentUploadDialog}
      />
    </>
  )
}

const DocumentCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex space-x-3">
        <Skeleton className="size-4 rounded mt-0.5" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-26 h-5 mb-1" />
          <Skeleton className="w-96 h-5 mb-1" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="size-9 rounded-lg" />
      </div>
    </div>
  )
}

const ClientDocumentDeleteButton = ({
  clientId,
  document
}: {
  clientId: string
  document: ClientDocument
}) => {
  const queryClient = useQueryClient()

  const { data: linkedKycs } = useQuery({
    ...getDocumentLinkedKycsQueryOptions(document.id),
    enabled: document ? true : false
  })

  const mutation = useMutation({
    mutationFn: deleteClientDocument,
    onError: () => {
      toast.error('No s’ha pogut eliminar el document del client')
    },
    onSuccess: () => {
      toast.success('Document del client eliminat correctament')

      queryClient.setQueryData(
        getClientDocumentsByIdQueryOptions(clientId).queryKey,
        existingDocuments =>
          existingDocuments!.filter(d => d.id !== document.id) ?? []
      )
    }
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={mutation.isPending}
          className="text-red-600 hover:text-red-700"
          variant="outline"
          size="icon"
        >
          {mutation.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar document - {document.name}</DialogTitle>
          <DialogDescription>
            Estàs segur que vols eliminar aquest document?
          </DialogDescription>
        </DialogHeader>

        {linkedKycs && linkedKycs.length > 0 && (
          <Alert variant={'destructive'}>
            <AlertCircleIcon />
            <AlertTitle>
              Aquest document està enllaçat a {linkedKycs.length} KYC
              {linkedKycs.length > 1 ? 's' : ''}
            </AlertTitle>
            <AlertDescription>
              <p>Si elimines aquest document:</p>
              <ul className="list-inside list-disc text-sm">
                <li>Es perdrà la relació amb els KYC</li>
                <li>
                  No es podrà veure si necessites consultar la documentació en
                  el futur
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel·lar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() =>
                mutation.mutate({ clientId, documentId: document.id })
              }
            >
              Eliminar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
