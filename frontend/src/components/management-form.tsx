import type { LegalPersonType, ManagementMember } from '@/lib/types'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { InputContainer } from './input-container'
import { Label } from './ui/label'
import { Input } from './ui/input'

export const ManagementForm = ({
  person,
  index,
  updatePerson,
  removePerson,
  totalPersons
}: {
  person: ManagementMember
  index: number
  updatePerson: (
    type: LegalPersonType,
    id: string,
    field: string,
    value: string
  ) => void
  removePerson: (type: LegalPersonType, id: string) => void
  totalPersons: number
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Membre de la Administració #{index + 1}</h5>
        {totalPersons > 1 && (
          <Button
            onClick={() => removePerson('management', person.id)}
            variant="outline"
            size="icon"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InputContainer>
          <Label>Noms i Cognoms *</Label>
          <Input
            value={person.fullName}
            onChange={e =>
              updatePerson('management', person.id, 'fullName', e.target.value)
            }
            placeholder="Nom complet"
          />
        </InputContainer>

        <InputContainer>
          <Label>Càrrec *</Label>
          <Input
            value={person.position}
            onChange={e =>
              updatePerson('management', person.id, 'position', e.target.value)
            }
            placeholder="Càrrec"
          />
        </InputContainer>

        <InputContainer>
          <Label>DNI/Passport</Label>
          <Input
            value={person.documentNumber}
            onChange={e =>
              updatePerson(
                'management',
                person.id,
                'documentNumber',
                e.target.value
              )
            }
            placeholder="DNI/Passport"
          />
        </InputContainer>

        <InputContainer>
          <Label>Data de naixement</Label>
          <Input
            value={person.dateOfBirth}
            onChange={e =>
              updatePerson(
                'management',
                person.id,
                'dateOfBirth',
                e.target.value
              )
            }
            placeholder="Data"
          />
        </InputContainer>

        <InputContainer>
          <Label>Tipus: (solidari, mancomunant, etc.)</Label>
          <Input
            value={person.type}
            onChange={e =>
              updatePerson('management', person.id, 'type', e.target.value)
            }
            placeholder="Tipus"
          />
        </InputContainer>

        <InputContainer>
          <Label>País Nacionalitat</Label>
          <Input
            value={person.countryOfBirth}
            onChange={e =>
              updatePerson(
                'management',
                person.id,
                'countryOfBirth',
                e.target.value
              )
            }
            placeholder="País"
          />
        </InputContainer>

        <InputContainer>
          <Label>País Residència</Label>
          <Input
            value={person.countryOfResidence}
            onChange={e =>
              updatePerson(
                'management',
                person.id,
                'countryOfResidence',
                e.target.value
              )
            }
            placeholder="País"
          />
        </InputContainer>
      </div>
    </div>
  )
}
