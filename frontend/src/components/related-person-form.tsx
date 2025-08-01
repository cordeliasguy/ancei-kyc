import type { LegalPersonType, RelatedPerson } from '@/lib/types'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { InputContainer } from './input-container'
import { Label } from './ui/label'
import { Input } from './ui/input'

export const RelatedPersonForm = ({
  person,
  index,
  updatePerson,
  removePerson,
  totalPersons
}: {
  person: RelatedPerson
  index: number
  updatePerson: (
    type: LegalPersonType | 'related',
    id: string,
    field: string,
    value: string
  ) => void
  removePerson: (type: LegalPersonType | 'related', id: string) => void
  totalPersons: number
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Persona #{index + 1}</h5>
        {totalPersons > 1 && (
          <Button
            onClick={() => removePerson('related', person.id)}
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
              updatePerson('related', person.id, 'fullName', e.target.value)
            }
            placeholder="Nom complet"
          />
        </InputContainer>

        <InputContainer>
          <Label>Càrrec del PEP *</Label>
          <Input
            value={person.position}
            onChange={e =>
              updatePerson('related', person.id, 'position', e.target.value)
            }
            placeholder="Càrrec"
          />
        </InputContainer>

        <InputContainer>
          <Label>Dates d'exercici *</Label>
          <Input
            value={person.period}
            onChange={e =>
              updatePerson('related', person.id, 'period', e.target.value)
            }
            placeholder="Dates"
          />
        </InputContainer>

        <InputContainer>
          <Label>País *</Label>
          <Input
            value={person.country}
            onChange={e =>
              updatePerson('related', person.id, 'country', e.target.value)
            }
            placeholder="País"
          />
        </InputContainer>

        <InputContainer>
          <Label>Vincle familiar / afí *</Label>
          <Input
            value={person.relationship}
            onChange={e =>
              updatePerson('related', person.id, 'relationship', e.target.value)
            }
            placeholder="Vincle"
          />
        </InputContainer>
      </div>
    </div>
  )
}
