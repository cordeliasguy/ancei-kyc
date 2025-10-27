import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import type { Client } from '@server/sharedTypes'
import { UploadDropzone } from '@/utils/uploadthing'
import { InputContainer } from './input-container'
import {
  getClientDocumentsByIdQueryOptions,
  uploadClientDocument
} from '@/lib/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export const UploadClientDocumentDialog = ({
  uploadingClient,
  showDocumentUploadDialog,
  setShowDocumentUploadDialog
}: {
  uploadingClient: Client
  showDocumentUploadDialog: boolean
  setShowDocumentUploadDialog: Dispatch<SetStateAction<boolean>>
}) => {
  const queryClient = useQueryClient()

  const [documentName, setDocumentName] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)

  const isDateValid = date && date > new Date()

  const resetForm = () => {
    setDocumentName('')
    setDate(undefined)
  }

  const handleOpenChange = (open: boolean) => {
    setShowDocumentUploadDialog(open)
    if (!open) resetForm()
  }

  return (
    <Dialog open={showDocumentUploadDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pujar document</DialogTitle>
          <DialogDescription>
            Pujant document per a: {uploadingClient.fullName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 w-full">
            <InputContainer className="w-full">
              <Label htmlFor="description">Nom*</Label>
              <Input
                id="description"
                value={documentName}
                onChange={e => setDocumentName(e.target.value)}
                placeholder="Nom del document"
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="date">Data de caducitat*</Label>
              <Input
                id="date"
                type="date"
                value={date ? date.toISOString().split('T')[0] : ''}
                onChange={e =>
                  setDate(e.target.value ? new Date(e.target.value) : undefined)
                }
                min={new Date().toISOString().split('T')[0]}
              />
            </InputContainer>
          </div>

          <UploadDropzone
            endpoint="blobUploader"
            onClientUploadComplete={async res => {
              console.log('res', res)

              if (!date || !documentName) return

              const {
                ufsUrl: fileUrl,
                type: fileType,
                size: fileSize
              } = res?.[0] ?? {}

              setShowDocumentUploadDialog(false)
              toast.loading('S’està pujant el document...')

              try {
                const existingDocuments = await queryClient.ensureQueryData(
                  getClientDocumentsByIdQueryOptions(uploadingClient.id)
                )

                const newDocument = await uploadClientDocument({
                  clientId: uploadingClient.id,
                  value: {
                    name: documentName,
                    url: fileUrl,
                    type: fileType,
                    size: fileSize,
                    expiresAt: date.toISOString()
                  }
                })

                queryClient.setQueryData(
                  getClientDocumentsByIdQueryOptions(uploadingClient.id)
                    .queryKey,
                  [newDocument, ...existingDocuments]
                )

                toast.dismiss()
                toast.success(
                  `S’ha pujat correctament el document: ${newDocument.name}`
                )
              } catch (error) {
                console.error(error)
                toast.dismiss()
                toast.error('Error del servidor en pujar el document')
              } finally {
                setDocumentName('')
                setDate(undefined)
              }
            }}
            onUploadError={(error: Error) => {
              console.error(error)
              toast.dismiss()
              toast.error('Error del gestor d’arxius en pujar el document')
            }}
            disabled={!documentName || !isDateValid}
            className="ut-button:cursor-pointer ut-button:data-[state=disabled]:cursor-auto ut-button:data-[state=disabled]:focus:ring-0 ut-label:data-[state=disabled]:cursor-auto ut-label:data-[state=disabled]:hover:text-gray-600 ut-label:data-[state=disabled]:pointer-events-none "
            content={{
              label: 'Arrossega el fitxer aquí o fes clic per seleccionar',
              allowedContent: 'Fitxer (màx. 8MB)',
              button(arg) {
                const isFileSelected = arg.files.length > 0

                return (
                  <div className="ut-button">
                    {isFileSelected ? (
                      <span>Pujar fitxer</span>
                    ) : (
                      <span>Seleccionar fitxer</span>
                    )}
                  </div>
                )
              }
            }}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel·la
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
