import type { LegalPersonType, UBO } from '@/lib/types'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { InputContainer } from './input-container'
import { Label } from './ui/label'
import { Input } from './ui/input'

export const UBOForm = ({
  person,
  index,
  updatePerson,
  removePerson,
  totalPersons
}: {
  person: UBO
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
        <h5 className="font-medium">UBO #{index + 1}</h5>
        {totalPersons > 1 && (
          <Button
            onClick={() => removePerson('ubos', person.id)}
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
              updatePerson('ubos', person.id, 'fullName', e.target.value)
            }
            placeholder="Nom complet"
          />
        </InputContainer>

        <InputContainer>
          <Label>Nacionalitat</Label>
          <Input
            value={person.nationality}
            onChange={e =>
              updatePerson('ubos', person.id, 'nationality', e.target.value)
            }
            placeholder="Nacionalitat"
          />
        </InputContainer>

        <InputContainer>
          <Label>Número DNI/Passport</Label>
          <Input
            value={person.documentNumber}
            onChange={e =>
              updatePerson('ubos', person.id, 'documentNumber', e.target.value)
            }
            placeholder="DNI/Passport"
          />
        </InputContainer>

        <InputContainer>
          <Label>Posició (**) que ocupa en la persona jurídica</Label>
          <Input
            value={person.position}
            onChange={e =>
              updatePerson('ubos', person.id, 'position', e.target.value)
            }
            placeholder="Posició"
          />
        </InputContainer>
      </div>
    </div>
  )
}
