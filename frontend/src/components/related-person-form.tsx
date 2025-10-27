import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { InputContainer } from './input-container'
import { Label } from './ui/label'
import { Input } from './ui/input'
import type { FormRelatedPerson } from '@server/sharedTypes'

export const RelatedPersonForm = ({
  person,
  index,
  updatePerson,
  removePerson,
  isViewing = false
}: {
  person: FormRelatedPerson
  index: number
  updatePerson: (id: string, field: string, value: string) => void
  removePerson: (id: string) => void
  isViewing?: boolean
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium">Persona #{index + 1}</h5>

        <Button
          onClick={() => removePerson(person.id)}
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
            onChange={e => updatePerson(person.id, 'fullName', e.target.value)}
            placeholder="Nom complet"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Càrrec del PEP *</Label>
          <Input
            value={person.position || ''}
            onChange={e => updatePerson(person.id, 'position', e.target.value)}
            placeholder="Càrrec"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Dates d'exercici *</Label>
          <Input
            value={person.period || ''}
            onChange={e => updatePerson(person.id, 'period', e.target.value)}
            placeholder="Dates"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>País *</Label>
          <Input
            value={person.country || ''}
            onChange={e => updatePerson(person.id, 'country', e.target.value)}
            placeholder="País"
            disabled={isViewing}
          />
        </InputContainer>

        <InputContainer>
          <Label>Vincle familiar / afí</Label>
          <Input
            value={person.relationship || ''}
            onChange={e =>
              updatePerson(person.id, 'relationship', e.target.value)
            }
            placeholder="Vincle"
            disabled={isViewing}
          />
        </InputContainer>
      </div>
    </div>
  )
}
