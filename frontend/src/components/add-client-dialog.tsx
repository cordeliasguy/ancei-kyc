import { useState, type Dispatch, type SetStateAction } from 'react'
import { InputContainer } from './input-container'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'
import {
  createClient,
  getAllAgencyClientsQueryOptions,
  loadingCreateClientQueryOptions
} from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { EntityType } from '@server/sharedTypes'

export const AddClientDialog = ({
  showAddClientDialog,
  setShowAddClientDialog
}: {
  showAddClientDialog: boolean
  setShowAddClientDialog: Dispatch<SetStateAction<boolean>>
}) => {
  const queryClient = useQueryClient()

  const [client, setClient] = useState({
    fullName: '',
    email: '',
    phone: '',
    type: 'natural' as EntityType
  })

  const resetForm = () => {
    setClient({
      fullName: '',
      email: '',
      phone: '',
      type: 'natural'
    })
  }

  const handleOnAddClient = async () => {
    toast.loading(`Creant client: ${client.fullName}`)

    const existingClients = await queryClient.ensureQueryData(
      getAllAgencyClientsQueryOptions
    )

    setShowAddClientDialog(false)

    queryClient.setQueryData(loadingCreateClientQueryOptions.queryKey, {
      client
    })

    try {
      const newClient = await createClient({ value: client })

      queryClient.setQueryData(getAllAgencyClientsQueryOptions.queryKey, [
        newClient,
        ...existingClients
      ])

      toast.dismiss()
      toast.success(`Client creat correctament: ${newClient.fullName}`)
      resetForm()
    } catch (error) {
      console.error(error)

      toast.dismiss()
      toast.error(`No s'ha pogut crear el client: ${client.fullName}`)
    } finally {
      queryClient.setQueryData(loadingCreateClientQueryOptions.queryKey, {})
    }
  }

  const handleOpenChange = (open: boolean) => {
    setShowAddClientDialog(open)
    if (!open) resetForm()
  }

  return (
    <Dialog open={showAddClientDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nou Client</DialogTitle>
          <DialogDescription>
            Afegeix un nou client al sistema
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <InputContainer>
            <Label htmlFor="name">Nom i cognoms / Nom de l’empresa</Label>
            <Input
              id="name"
              value={client.fullName}
              onChange={e => setClient({ ...client, fullName: e.target.value })}
              placeholder="Introdueix el nom complet o el nom de l’empresa"
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="email">Correu electrònic</Label>
            <Input
              id="email"
              type="email"
              value={client.email}
              onChange={e => setClient({ ...client, email: e.target.value })}
              placeholder="Introdueix l’adreça electrònica"
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="phone">Telèfon</Label>
            <Input
              id="phone"
              value={client.phone}
              onChange={e => setClient({ ...client, phone: e.target.value })}
              placeholder="Introdueix el número de telèfon"
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="type">Tipus de client</Label>
            <Select
              value={client.type}
              onValueChange={(value: EntityType) =>
                setClient({ ...client, type: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">P. Física</SelectItem>
                <SelectItem value="legal">P. Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </InputContainer>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel·la
            </Button>
            <Button
              onClick={handleOnAddClient}
              disabled={!client.fullName || !client.email || !client.phone}
            >
              Registra client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
