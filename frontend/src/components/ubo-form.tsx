import type { LegalPerson } from '@/lib/types'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { InputContainer } from './input-container'
import { Label } from './ui/label'
import { Input } from './ui/input'
import type { FormUbo } from '@server/sharedTypes'

export const UBOForm = ({
  person,
  index,
  updatePerson,
  removePerson,
  isViewing = false
}: {
  person: FormUbo
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
  const updateUBO = (id: string, field: string, value: string) => {
    updatePerson(id, field, value, 'ubos')
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">UBO #{index + 1}</h5>

        <Button
          onClick={() => removePerson(person.id, 'ubos')}
          variant="outline"
          size="icon"
          disabled={isViewing}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InputContainer>
          <Label>Noms i Cognoms *</Label>
          <Input
            value={person.fullName}
            onChange={e => updateUBO(person.id, 'fullName', e.target.value)}
            placeholder="Nom complet"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Nacionalitat</Label>
          <Input
            value={person.nationality || ''}
            onChange={e => updateUBO(person.id, 'nationality', e.target.value)}
            placeholder="Nacionalitat"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Número DNI/Passport</Label>
          <Input
            value={person.documentNumber || ''}
            onChange={e =>
              updateUBO(person.id, 'documentNumber', e.target.value)
            }
            placeholder="DNI/Passport"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Posició (**) que ocupa en la persona jurídica</Label>
          <Input
            value={person.position || ''}
            onChange={e => updateUBO(person.id, 'position', e.target.value)}
            placeholder="Posició"
            disabled={isViewing}
          />
        </InputContainer>
      </div>
    </div>
  )
}
