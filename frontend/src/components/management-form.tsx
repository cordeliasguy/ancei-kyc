import type { LegalPerson } from '@/lib/types'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { InputContainer } from './input-container'
import { Label } from './ui/label'
import { Input } from './ui/input'
import type { FormManagementPerson } from '@server/sharedTypes'

export const ManagementForm = ({
  person,
  index,
  updatePerson,
  removePerson,
  isViewing = false
}: {
  person: FormManagementPerson
  index: number
  updatePerson: (
    id: string,
    field: string,
    value: string,
    type?: LegalPerson
  ) => void
  removePerson: (id: string, type?: LegalPerson) => void
  isViewing?: boolean
}) => {
  const updateManagement = (id: string, field: string, value: string) => {
    updatePerson(id, field, value, 'management')
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Membre de la Administració #{index + 1}</h5>

        <Button
          onClick={() => removePerson(person.id, 'management')}
          variant="outline"
          size="icon"
          disabled={isViewing}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InputContainer>
          <Label>Noms i Cognoms *</Label>
          <Input
            value={person.fullName}
            onChange={e =>
              updateManagement(person.id, 'fullName', e.target.value)
            }
            placeholder="Nom complet"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Càrrec *</Label>
          <Input
            value={person.position || ''}
            onChange={e =>
              updateManagement(person.id, 'position', e.target.value)
            }
            placeholder="Càrrec"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>DNI/Passport</Label>
          <Input
            value={person.documentNumber || ''}
            onChange={e =>
              updateManagement(person.id, 'documentNumber', e.target.value)
            }
            placeholder="DNI/Passport"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Data de naixement</Label>
          <Input
            value={person.dateOfBirth || ''}
            onChange={e =>
              updateManagement(person.id, 'dateOfBirth', e.target.value)
            }
            placeholder="Data"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Tipus: (solidari, mancomunant, etc.)</Label>
          <Input
            value={person.type || ''}
            onChange={e => updateManagement(person.id, 'type', e.target.value)}
            placeholder="Tipus"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>País Nacionalitat</Label>
          <Input
            value={person.countryOfBirth || ''}
            onChange={e =>
              updateManagement(person.id, 'countryOfBirth', e.target.value)
            }
            placeholder="País"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>País Residència</Label>
          <Input
            value={person.countryOfResidence || ''}
            onChange={e =>
              updateManagement(person.id, 'countryOfResidence', e.target.value)
            }
            placeholder="País"
            disabled={isViewing}
          />
        </InputContainer>
      </div>
    </div>
  )
}
