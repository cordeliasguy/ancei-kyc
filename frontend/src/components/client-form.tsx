import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Link } from '@tanstack/react-router'
import type { Client } from '@server/routes/clients'
import { useEffect, useReducer, useState } from 'react'
import { FileUpload } from './file-upload'

type Props = {
  client?: Client | null
}

type Representative = {
  name: string
  role: string
}

type Beneficiary = {
  name: string
  directPercentage: number
  indirectPercentage: number
}

type BaseFormData = {
  name: string
  address: string
  economicActivity: string
  fundsOrigin: string
  requestedServices: string[]
  isPEP: boolean
  pepDetails?: string
  pepRelation?: string
  files?: Array<{
    id: string
    name: string
    type: string
    size: number
    uploadedAt: string
    content?: string
  }>
}

type LegalFormData = BaseFormData & {
  type: 'legal'
  representatives: Representative[]
  beneficiaries: Beneficiary[]
  operatingCountries: string[]
}

type NaturalFormData = BaseFormData & {
  type: 'natural'
  countryOfResidence: string
  nationalities: string[]
  email: string
  phone: string
  language: string
}

export type FormData = LegalFormData | NaturalFormData

// Action types for reducer
type FormAction =
  | { type: 'SET_FIELD'; field: string; value: unknown }
  | { type: 'ADD_REPRESENTATIVE' }
  | { type: 'REMOVE_REPRESENTATIVE'; index: number }
  | {
      type: 'UPDATE_REPRESENTATIVE'
      index: number
      field: keyof Representative
      value: string
    }
  | { type: 'ADD_BENEFICIARY' }
  | { type: 'REMOVE_BENEFICIARY'; index: number }
  | {
      type: 'UPDATE_BENEFICIARY'
      index: number
      field: keyof Beneficiary
      value: string | number
    }
  | { type: 'INITIALIZE_FORM'; client: Client }

// Initial state factory
const createInitialState = (client?: Client | null): FormData => {
  const baseState = {
    name: client?.name || '',
    address: client?.address || '',
    economicActivity: client?.economicActivity || '',
    fundsOrigin: client?.fundsOrigin || '',
    requestedServices: client?.requestedServices || [],
    isPEP: client?.isPEP || false,
    pepDetails: client?.pepDetails || '',
    pepRelation: client?.pepRelation || ''
  }

  if (client?.type === 'legal') {
    return {
      ...baseState,
      type: 'legal',
      representatives: client.representatives || [{ name: '', role: '' }],
      beneficiaries: client.beneficiaries || [
        { name: '', directPercentage: 0, indirectPercentage: 0 }
      ],
      operatingCountries: client.operatingCountries || []
    }
  }

  return {
    ...baseState,
    type: 'natural',
    countryOfResidence: client?.countryOfResidence || '',
    nationalities: client?.nationalities || [],
    email: client?.email || '',
    phone: client?.phone || '',
    language: client?.language || ''
  }
}

// Form reducer
const formReducer = (state: FormData, action: FormAction): FormData => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    case 'ADD_REPRESENTATIVE':
      if (state.type === 'legal') {
        return {
          ...state,
          representatives: [...state.representatives, { name: '', role: '' }]
        }
      }
      return state

    case 'REMOVE_REPRESENTATIVE':
      if (state.type === 'legal') {
        return {
          ...state,
          representatives: state.representatives.filter(
            (_, i) => i !== action.index
          )
        }
      }
      return state

    case 'UPDATE_REPRESENTATIVE':
      if (state.type === 'legal') {
        return {
          ...state,
          representatives: state.representatives.map((rep, i) =>
            i === action.index ? { ...rep, [action.field]: action.value } : rep
          )
        }
      }
      return state

    case 'ADD_BENEFICIARY':
      if (state.type === 'legal') {
        return {
          ...state,
          beneficiaries: [
            ...state.beneficiaries,
            { name: '', directPercentage: 0, indirectPercentage: 0 }
          ]
        }
      }
      return state

    case 'REMOVE_BENEFICIARY':
      if (state.type === 'legal') {
        return {
          ...state,
          beneficiaries: state.beneficiaries.filter(
            (_, i) => i !== action.index
          )
        }
      }
      return state

    case 'UPDATE_BENEFICIARY':
      if (state.type === 'legal') {
        return {
          ...state,
          beneficiaries: state.beneficiaries.map((ben, i) =>
            i === action.index ? { ...ben, [action.field]: action.value } : ben
          )
        }
      }
      return state

    case 'INITIALIZE_FORM':
      return createInitialState(action.client)

    default:
      return state
  }
}

export const ClientForm = ({ client }: Props) => {
  const isEdit = !!client
  const [formData, dispatch] = useReducer(
    formReducer,
    createInitialState(client)
  )

  const [files, setFiles] = useState<
    Array<{
      id: string
      name: string
      type: string
      size: number
      uploadedAt: string
      content?: string
    }>
  >(client?.files || [])

  useEffect(() => {
    if (client) {
      dispatch({ type: 'INITIALIZE_FORM', client })
    }
  }, [client])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form data:', formData)
  }

  const handleFieldChange = (field: string, value: unknown) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  const handleParseFiles = async () => {
    try {
      // Update form data with parsed information
      console.log('Parsing files...')
    } catch (error) {
      console.error('Error parsing files:', error)
    }
  }

  // Helper to convert array to string for display
  const arrayToString = (arr: string[]) => arr.join(', ')
  const stringToArray = (str: string) =>
    str
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" className="mb-4 bg-transparent" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Client' : 'Add New Client'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit
              ? 'Update client information'
              : 'Enter client information for KYC documentation'}
          </p>
        </div>

        <FileUpload
          clientId={String(client?.id) || 'new'}
          files={files}
          onFilesChange={setFiles}
          onParseFiles={handleParseFiles}
        />

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                {formData.type === 'legal'
                  ? 'Company details and address'
                  : 'Personal details and address'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {formData.type === 'legal'
                    ? 'Company Name (Denominació social)'
                    : 'Full Name'}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  placeholder={
                    formData.type === 'legal'
                      ? 'Enter company name'
                      : 'Enter full name'
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  {formData.type === 'legal'
                    ? 'Social Address (Domicili social)'
                    : 'Address'}
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={e => handleFieldChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  required
                />
              </div>

              {/* Natural person specific fields */}
              {formData.type === 'natural' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => handleFieldChange('email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={e => handleFieldChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryOfResidence">
                      Country of Residence
                    </Label>
                    <Input
                      id="countryOfResidence"
                      value={formData.countryOfResidence}
                      onChange={e =>
                        handleFieldChange('countryOfResidence', e.target.value)
                      }
                      placeholder="Enter country of residence"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalities">Nationalities</Label>
                    <Input
                      id="nationalities"
                      value={arrayToString(formData.nationalities)}
                      onChange={e =>
                        handleFieldChange(
                          'nationalities',
                          stringToArray(e.target.value)
                        )
                      }
                      placeholder="Enter nationalities (comma separated)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={formData.language}
                      onChange={e =>
                        handleFieldChange('language', e.target.value)
                      }
                      placeholder="Preferred language"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Representatives - Legal entities only */}
          {formData.type === 'legal' && (
            <Card>
              <CardHeader>
                <CardTitle>Representatives (Representants)</CardTitle>
                <CardDescription>
                  Legal representatives of the company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.representatives.map((rep, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={rep.name}
                        onChange={e =>
                          dispatch({
                            type: 'UPDATE_REPRESENTATIVE',
                            index,
                            field: 'name',
                            value: e.target.value
                          })
                        }
                        placeholder="Full name"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={rep.role}
                        onChange={e =>
                          dispatch({
                            type: 'UPDATE_REPRESENTATIVE',
                            index,
                            field: 'role',
                            value: e.target.value
                          })
                        }
                        placeholder="Position/Role"
                      />
                    </div>
                    {formData.representatives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          dispatch({ type: 'REMOVE_REPRESENTATIVE', index })
                        }
                        className="cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dispatch({ type: 'ADD_REPRESENTATIVE' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Representative
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Beneficial Owners - Legal entities only */}
          {formData.type === 'legal' && (
            <Card>
              <CardHeader>
                <CardTitle>Beneficial Owners (Beneficiaris efectius)</CardTitle>
                <CardDescription>
                  Ultimate beneficial owners with ownership percentages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.beneficiaries.map((ben, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={ben.name}
                        onChange={e =>
                          dispatch({
                            type: 'UPDATE_BENEFICIARY',
                            index,
                            field: 'name',
                            value: e.target.value
                          })
                        }
                        placeholder="Full name"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Direct %</Label>
                      <Input
                        type="number"
                        value={ben.directPercentage}
                        onChange={e =>
                          dispatch({
                            type: 'UPDATE_BENEFICIARY',
                            index,
                            field: 'directPercentage',
                            value: Number.parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Indirect %</Label>
                      <Input
                        type="number"
                        value={ben.indirectPercentage}
                        onChange={e =>
                          dispatch({
                            type: 'UPDATE_BENEFICIARY',
                            index,
                            field: 'indirectPercentage',
                            value: Number.parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    {formData.beneficiaries.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          dispatch({ type: 'REMOVE_BENEFICIARY', index })
                        }
                        className="cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dispatch({ type: 'ADD_BENEFICIARY' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Beneficial Owner
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Business Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Business Activity</CardTitle>
              <CardDescription>
                Economic activity and operational details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="economicActivity">
                  Economic Activity (Activitat econòmica)
                </Label>
                <Textarea
                  id="economicActivity"
                  value={formData.economicActivity}
                  onChange={e =>
                    handleFieldChange('economicActivity', e.target.value)
                  }
                  placeholder="Describe the main economic activity"
                  required
                />
              </div>
              {formData.type === 'legal' && (
                <div className="space-y-2">
                  <Label htmlFor="operatingCountries">
                    Operating Countries
                  </Label>
                  <Input
                    id="operatingCountries"
                    value={arrayToString(formData.operatingCountries)}
                    onChange={e =>
                      handleFieldChange(
                        'operatingCountries',
                        stringToArray(e.target.value)
                      )
                    }
                    placeholder="Countries where the company operates (comma separated)"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* PEP Information */}
          <Card>
            <CardHeader>
              <CardTitle>Politically Exposed Person (PEP)</CardTitle>
              <CardDescription>
                Information about political exposure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPEP"
                  checked={formData.isPEP}
                  onCheckedChange={checked =>
                    handleFieldChange('isPEP', checked)
                  }
                />
                <Label htmlFor="isPEP">
                  Is this client a Politically Exposed Person?
                </Label>
              </div>
              {formData.isPEP && (
                <div className="space-y-2">
                  <Label htmlFor="pepDetails">PEP Details</Label>
                  <Textarea
                    id="pepDetails"
                    value={formData.pepDetails || ''}
                    onChange={e =>
                      handleFieldChange('pepDetails', e.target.value)
                    }
                    placeholder="Details about political exposure"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="pepRelation">Relation with PEP</Label>
                <Textarea
                  id="pepRelation"
                  value={formData.pepRelation || ''}
                  onChange={e =>
                    handleFieldChange('pepRelation', e.target.value)
                  }
                  placeholder="Any relation with politically exposed persons"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Funds origin and requested services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fundsOrigin">
                  Origin of Funds (Origen dels fons)
                </Label>
                <Textarea
                  id="fundsOrigin"
                  value={formData.fundsOrigin}
                  onChange={e =>
                    handleFieldChange('fundsOrigin', e.target.value)
                  }
                  placeholder="Describe the origin of funds"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedServices">
                  Requested Services (Serveis sol·licitats)
                </Label>
                <Input
                  id="requestedServices"
                  value={arrayToString(formData.requestedServices)}
                  onChange={e =>
                    handleFieldChange(
                      'requestedServices',
                      stringToArray(e.target.value)
                    )
                  }
                  placeholder="e.g., Comptabilitat, IGI, IS (comma separated)"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {isEdit ? 'Update Client' : 'Add Client'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
