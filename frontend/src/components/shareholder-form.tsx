import type { LegalPersonType, Shareholder } from '@/lib/types'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { InputContainer } from './input-container'
import { Label } from './ui/label'
import { Input } from './ui/input'

export const ShareholderForm = ({
  person,
  index,
  updatePerson,
  removePerson,
  totalPersons
}: {
  person: Shareholder
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
        <h5 className="font-medium">Accionista #{index + 1}</h5>
        {totalPersons > 1 && (
          <Button
            onClick={() => removePerson('shareholders', person.id)}
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
              updatePerson(
                'shareholders',
                person.id,
                'fullName',
                e.target.value
              )
            }
            placeholder="Nom complet"
          />
        </InputContainer>

        <InputContainer>
          <Label>DNI/Passport</Label>
          <Input
            value={person.documentNumber}
            onChange={e =>
              updatePerson(
                'shareholders',
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
                'shareholders',
                person.id,
                'dateOfBirth',
                e.target.value
              )
            }
            placeholder="Data"
          />
        </InputContainer>

        <InputContainer>
          <Label>Activitat professional / laboral *</Label>
          <Input
            value={person.professionalActivity}
            onChange={e =>
              updatePerson(
                'shareholders',
                person.id,
                'professionalActivity',
                e.target.value
              )
            }
            placeholder="Activitat"
          />
        </InputContainer>

        <InputContainer>
          <Label>País Nacionalitat</Label>
          <Input
            value={person.countryOfBirth}
            onChange={e =>
              updatePerson(
                'shareholders',
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
                'shareholders',
                person.id,
                'countryOfResidence',
                e.target.value
              )
            }
            placeholder="País"
          />
        </InputContainer>

        <InputContainer>
          <Label>% accions</Label>
          <Input
            value={person.ownershipPercentage}
            onChange={e =>
              updatePerson(
                'shareholders',
                person.id,
                'ownershipPercentage',
                e.target.value
              )
            }
            placeholder="%"
          />
        </InputContainer>
      </div>
    </div>
  )
}
