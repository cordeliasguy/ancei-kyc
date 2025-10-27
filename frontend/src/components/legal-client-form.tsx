import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  FileText,
  Send,
  MapPinHouse,
  Handshake,
  Plus,
  Building,
  HousePlus,
  Trash2,
  IdCard,
  Shield
} from 'lucide-react'
import { SignaturePad } from '@/components/signature-pad'
import { Separator } from '@/components/ui/separator'
import { InputContainer } from '@/components/input-container'
import { RelatedPersonForm } from '@/components/related-person-form'
import { v4 as uuidv4 } from 'uuid'
import type {
  FormManagementPerson,
  FormRelatedPerson,
  FormShareholder,
  FormUbo
} from '@server/sharedTypes'
import type { KYCSession, KYCFormData, LegalPerson } from '@/lib/types'
import { toast } from 'sonner'
import { base64ToFile, getFilledNameEntries } from '@/lib/utils'
import { uploadFiles } from '@/utils/uploadthing'
import {
  linkClientDocument,
  createKycDocument,
  createRelatedPersons,
  uploadClientDocument,
  createUbos,
  createShareholders,
  createManagementPersons
} from '@/lib/api'
import { useNavigate } from '@tanstack/react-router'
import { ManagementForm } from './management-form'
import { ShareholderForm } from './shareholder-form'
import { UBOForm } from './ubo-form'
import { Spinner } from './ui/spinner'

type Props = {
  existingData?: KYCFormData
  setExistingData?: Dispatch<SetStateAction<KYCFormData>>
  existingRelatedPersons?: FormRelatedPerson[]
  setExistingRelatedPersons?: Dispatch<SetStateAction<FormRelatedPerson[]>>
  existingManagementMembers?: FormManagementPerson[]
  setExistingManagementMembers?: Dispatch<
    SetStateAction<FormManagementPerson[]>
  >
  existingShareholders?: FormShareholder[]
  setExistingShareholders?: Dispatch<SetStateAction<FormShareholder[]>>
  existingUbos?: FormUbo[]
  setExistingUbos?: Dispatch<SetStateAction<FormUbo[]>>
  kycSession?: KYCSession
  isViewing?: boolean
}

export const LegalClientForm = ({
  existingData,
  setExistingData,
  existingRelatedPersons,
  setExistingRelatedPersons,
  existingManagementMembers,
  setExistingManagementMembers,
  existingShareholders,
  setExistingShareholders,
  existingUbos,
  setExistingUbos,
  kycSession,
  isViewing = false
}: Props) => {
  const navigate = useNavigate()
  const isClientSubmit = !existingData && !!kycSession
  const isOcicReview =
    existingData && existingData.status === 'compliance_reviewed' && !kycSession

  const [representativeSignature, setRepresentativeSignature] = useState<
    string | null
  >(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<KYCFormData>({
    // Company Information
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    registrationDate: '',
    registrationCity: '',
    taxId: '',
    companyPurpose: '',
    geographicScope: '',
    annualRevenue: '',

    // Addresses
    fiscalAddress: '',
    fiscalCity: '',
    fiscalPostalCode: '',
    fiscalCountry: '',
    postalAddress: '',
    postalCity: '',
    postalPostalCode: '',
    postalCountry: '',

    // Branches
    hasBranches: '',
    branchesDetails: '',
    isMainBranch: '',
    mainBranchDetails: '',
    isListedOnRegulatedMarket: '',
    regulatedMarketDetails: '',

    // Business Purpose
    businessPurpose: '',

    // Representative Information
    representativeFullName: '',
    representativeDateOfBirth: '',
    representativeCountryOfBirth: '',
    representativeNationality: '',
    representativeDocumentType: '',
    representativeDocumentNumber: '',
    representativeGender: '',
    representativeProfessionalActivity: '',
    representativeProfession: '',
    representativeMaritalStatus: '',
    representativePartnerFullName: '',
    representativeMaritalEconomicRegime: '',
    representativePhone: '',
    representativeEmail: '',

    // Declarations 1
    fundsNotFromMoneyLaundering: false,
    fundsSource: false,
    fundsSourceDetails: '',
    actingOnOwnBehalf: false,
    actingOnBehalfOfThirdParty: false,
    thirdPartyRepresented: '',

    // PEP Declarations
    hasHeldPublicFunction: '',
    familyHasHeldPublicFunction: '',
    closePersonHasHeldPublicFunction: '',
    activityRegions: [''],
    cashUsage: '',
    isRiskySector: '',
    riskySector: '',

    // Declarations 2
    authorizedVerification: false,
    noTaxProcedure: false,
    legalFundsOrigin: false
  })

  const [relatedPersons, setRelatedPersons] = useState<FormRelatedPerson[]>([])
  const [managementMembers, setManagementMembers] = useState<
    FormManagementPerson[]
  >([])
  const [shareholders, setShareholders] = useState<FormShareholder[]>([])
  const [ubos, setUbos] = useState<FormUbo[]>([])

  const handleInputChange = (field: string, value: string | boolean) => {
    const newData = {
      ...formData,
      [field]: value
    }
    setFormData(newData)

    // Sync to parent if available
    setExistingData?.(newData)
  }

  const hasDeclarations =
    formData.authorizedVerification &&
    formData.noTaxProcedure &&
    formData.legalFundsOrigin

  const isFormValid = () => {
    const requiredFields = [
      'companyName',
      'companyPhone',
      'companyEmail',
      'registrationDate',
      'registrationCity',
      'taxId',
      'companyPurpose',
      'geographicScope',
      'annualRevenue'
    ]

    const hasRequiredFields = requiredFields.every(
      field => formData[field as keyof typeof formData]
    )

    return hasRequiredFields && hasDeclarations
  }

  const handleSubmit = async () => {
    if (!kycSession || !representativeSignature) return

    if (!isFormValid()) {
      toast.error('Si us plau, completeu tots els camps obligatoris ')
      return
    }

    setIsSubmitting(true)

    const submissionData = {
      ...formData,
      type: kycSession.clientType,
      clientId: kycSession.clientId,
      agencyId: kycSession.agencyId,
      services: kycSession.services.map(s => s.service)
    }

    try {
      const signatureFile = base64ToFile(representativeSignature)

      const fileInfo = await uploadFiles('blobUploader', {
        files: [signatureFile]
      })

      const signature = await uploadClientDocument({
        clientId: kycSession.clientId,
        value: {
          name: 'Signatura representant',
          url: fileInfo[0].ufsUrl,
          type: fileInfo[0].type,
          size: fileInfo[0].size,
          isSignature: true,
          expiresAt: new Date(
            new Date().setFullYear(new Date().getFullYear() + 100)
          ).toISOString()
        }
      })

      const kycDocument = await createKycDocument({
        value: submissionData
      })

      await linkClientDocument({
        documentId: signature.id,
        kycId: kycDocument.id
      })

      if (getFilledNameEntries(relatedPersons).length > 0) {
        const relatedPersonsWithKycId = relatedPersons.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createRelatedPersons({
          value: relatedPersonsWithKycId
        })
      }

      if (getFilledNameEntries(managementMembers).length > 0) {
        const managementPersonsWithKycId = managementMembers.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createManagementPersons({
          value: managementPersonsWithKycId
        })
      }

      if (getFilledNameEntries(shareholders).length > 0) {
        const shareholdersWithKycId = shareholders.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createShareholders({
          value: shareholdersWithKycId
        })
      }

      if (getFilledNameEntries(ubos).length > 0) {
        const ubosWithKycId = ubos.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createUbos({
          value: ubosWithKycId
        })
      }

      toast.success('Formulari enviat correctament')
      localStorage.removeItem('clientSession')
      navigate({ to: '/' })
    } catch (error) {
      console.error(error)
      toast.error('Error al enviar el formulari')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignature = (signature: string) => {
    setRepresentativeSignature(signature)
    setShowSignaturePad(false)
  }

  useEffect(() => {
    if (
      !existingData ||
      !existingRelatedPersons ||
      !existingManagementMembers ||
      !existingShareholders ||
      !existingUbos
    )
      return

    setFormData(existingData)
    setRelatedPersons(existingRelatedPersons)
    setManagementMembers(existingManagementMembers)
    setShareholders(existingShareholders)
    setUbos(existingUbos)
  }, [
    existingData,
    existingRelatedPersons,
    existingManagementMembers,
    existingShareholders,
    existingUbos
  ])

  useEffect(() => {
    if (!kycSession) return

    setFormData(prev => ({
      ...prev,
      companyName: kycSession.clientName || '',
      companyEmail: kycSession.clientEmail || '',
      companyPhone: kycSession.clientPhone || ''
    }))
  }, [kycSession])

  useEffect(() => {
    if (formData.isRiskySector === 'yes' || !formData.isRiskySector) return

    setFormData(prev => ({
      ...prev,
      riskySector: ''
    }))
    setExistingData?.(prev => ({
      ...prev,
      riskySector: ''
    }))
  }, [formData.isRiskySector, setExistingData])

  const addPerson = (type?: LegalPerson) => {
    if (type === 'management') {
      setManagementMembers(prev => [
        ...prev,
        {
          id: uuidv4(),
          kycId: '',
          fullName: '',
          position: '',
          documentNumber: '',
          dateOfBirth: '',
          type: '',
          countryOfBirth: '',
          countryOfResidence: ''
        }
      ])
    } else if (type === 'shareholders') {
      setShareholders(prev => [
        ...prev,
        {
          id: uuidv4(),
          kycId: '',
          fullName: '',
          documentNumber: '',
          dateOfBirth: '',
          professionalActivity: '',
          countryOfBirth: '',
          countryOfResidence: '',
          ownershipPercentage: ''
        }
      ])
    } else if (type === 'ubos') {
      setUbos(prev => [
        ...prev,
        {
          id: uuidv4(),
          kycId: '',
          fullName: '',
          nationality: '',
          documentNumber: '',
          position: ''
        }
      ])
    } else {
      setRelatedPersons(prev => [
        ...prev,
        {
          id: uuidv4(),
          kycId: '',
          fullName: '',
          position: '',
          period: '',
          country: '',
          relationship: ''
        }
      ])
    }
  }

  const removePerson = (id: string, type?: LegalPerson) => {
    if (type === 'management') {
      setManagementMembers(prev => prev.filter(p => p.id !== id))
    } else if (type === 'shareholders') {
      setShareholders(prev => prev.filter(p => p.id !== id))
    } else if (type === 'ubos') {
      setUbos(prev => prev.filter(p => p.id !== id))
    } else {
      setRelatedPersons(prev => prev.filter(p => p.id !== id))
    }
  }

  const updatePerson = (
    id: string,
    field: string,
    value: string,
    type?: LegalPerson
  ) => {
    if (type === 'management') {
      const updatedMembers = managementMembers.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
      setManagementMembers(updatedMembers)
      setExistingManagementMembers?.(updatedMembers)
    } else if (type === 'shareholders') {
      const updatedShareholders = shareholders.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
      setShareholders(updatedShareholders)
      setExistingShareholders?.(updatedShareholders)
    } else if (type === 'ubos') {
      const updatedUbos = ubos.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
      setUbos(updatedUbos)
      setExistingUbos?.(updatedUbos)
    } else {
      const updatedPersons = relatedPersons.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
      setRelatedPersons(updatedPersons)
      setExistingRelatedPersons?.(updatedPersons)
    }
  }

  return (
    <>
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            DADES DE LA SOCIETAT
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <InputContainer>
            <Label htmlFor="companyName">Raó social *</Label>
            <Input
              id="companyName"
              value={formData.companyName || ''}
              onChange={e => handleInputChange('companyName', e.target.value)}
              placeholder="Raó social"
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="companyPhone">Telèfon / Mòbil *</Label>
            <Input
              id="companyPhone"
              value={formData.companyPhone || ''}
              onChange={e => handleInputChange('companyPhone', e.target.value)}
              placeholder="+376 000 000"
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="companyEmail">Correu electrònic *</Label>
            <Input
              id="companyEmail"
              type="email"
              value={formData.companyEmail || ''}
              onChange={e => handleInputChange('companyEmail', e.target.value)}
              placeholder="info@empresa.com"
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="registrationDate">Data de constitució</Label>
            <Input
              id="registrationDate"
              type="date"
              value={formData.registrationDate || ''}
              onChange={e =>
                handleInputChange('registrationDate', e.target.value)
              }
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="registrationCity">Lloc de constitució</Label>
            <Input
              id="registrationCity"
              value={formData.registrationCity || ''}
              onChange={e =>
                handleInputChange('registrationCity', e.target.value)
              }
              placeholder="Lloc de constitució"
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="taxId">NIF/NRT *</Label>
            <Input
              id="taxId"
              value={formData.taxId || ''}
              onChange={e => handleInputChange('taxId', e.target.value)}
              placeholder="Número d'identificació fiscal"
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer className="md:col-span-2">
            <Label htmlFor="companyPurpose">Objecte social *</Label>
            <Textarea
              id="companyPurpose"
              value={formData.companyPurpose || ''}
              onChange={e =>
                handleInputChange('companyPurpose', e.target.value)
              }
              placeholder="Objecte social"
              rows={4}
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="geographicScope">
              Àmbit geogràfic de l’activitat *
            </Label>
            <Input
              id="geographicScope"
              value={formData.geographicScope || ''}
              onChange={e =>
                handleInputChange('geographicScope', e.target.value)
              }
              placeholder="Àmbit geogràfic"
              disabled={isViewing}
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="annualRevenue">Facturació anual *</Label>
            <Input
              id="annualRevenue"
              value={formData.annualRevenue || ''}
              onChange={e => handleInputChange('annualRevenue', e.target.value)}
              placeholder="Aprox. i/o prevista"
              disabled={isViewing}
            />
          </InputContainer>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center uppercase">
            <MapPinHouse className="size-5 mr-2" />
            Domicili
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-4 uppercase">Domicili Fiscal</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <InputContainer className="md:col-span-2">
                <Label htmlFor="fiscalAddress">Adreça *</Label>
                <Input
                  id="fiscalAddress"
                  value={formData.fiscalAddress || ''}
                  onChange={e =>
                    handleInputChange('fiscalAddress', e.target.value)
                  }
                  placeholder="Carrer, número, pis, porta"
                  disabled={isViewing}
                />
              </InputContainer>

              <InputContainer>
                <Label htmlFor="fiscalPostalCode">Codi Postal</Label>
                <Input
                  id="fiscalPostalCode"
                  value={formData.fiscalPostalCode || ''}
                  onChange={e =>
                    handleInputChange('fiscalPostalCode', e.target.value)
                  }
                  placeholder="08000"
                  disabled={isViewing}
                />
              </InputContainer>

              <InputContainer>
                <Label htmlFor="fiscalCity">Localitat *</Label>
                <Input
                  id="fiscalCity"
                  value={formData.fiscalCity || ''}
                  onChange={e =>
                    handleInputChange('fiscalCity', e.target.value)
                  }
                  placeholder="Localitat"
                  disabled={isViewing}
                />
              </InputContainer>

              <InputContainer>
                <Label htmlFor="fiscalCountry">País *</Label>
                <Input
                  id="fiscalCountry"
                  value={formData.fiscalCountry || ''}
                  onChange={e =>
                    handleInputChange('fiscalCountry', e.target.value)
                  }
                  placeholder="Espanya"
                  disabled={isViewing}
                />
              </InputContainer>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              <span className="uppercase">Domicili Postal</span>, si difereix
              del fiscal
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <InputContainer className="md:col-span-2">
                <Label htmlFor="postalAddress">Adreça</Label>
                <Input
                  id="postalAddress"
                  value={formData.postalAddress || ''}
                  onChange={e =>
                    handleInputChange('postalAddress', e.target.value)
                  }
                  placeholder="Carrer, número, pis, porta"
                  disabled={isViewing}
                />
              </InputContainer>

              <InputContainer>
                <Label htmlFor="postalPostalCode">Codi Postal</Label>
                <Input
                  id="postalPostalCode"
                  value={formData.postalPostalCode || ''}
                  onChange={e =>
                    handleInputChange('postalPostalCode', e.target.value)
                  }
                  placeholder="08000"
                  disabled={isViewing}
                />
              </InputContainer>

              <InputContainer>
                <Label htmlFor="postalCity">Localitat</Label>
                <Input
                  id="postalCity"
                  value={formData.postalCity || ''}
                  onChange={e =>
                    handleInputChange('postalCity', e.target.value)
                  }
                  placeholder="Localitat"
                  disabled={isViewing}
                />
              </InputContainer>

              <InputContainer>
                <Label htmlFor="postalCountry">País</Label>
                <Input
                  id="postalCountry"
                  value={formData.postalCountry || ''}
                  onChange={e =>
                    handleInputChange('postalCountry', e.target.value)
                  }
                  placeholder="Espanya"
                  disabled={isViewing}
                />
              </InputContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center uppercase">
            <HousePlus className="size-5 mr-2" />
            Sucursals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InputContainer>
            <Label className="text-sm font-medium">Sucursals *</Label>
            <RadioGroup
              value={formData.hasBranches}
              onValueChange={value => handleInputChange('hasBranches', value)}
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="has-branches-yes" />
                <Label htmlFor="has-branches-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="has-branches-no" />
                <Label htmlFor="has-branches-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          {formData.hasBranches === 'yes' && (
            <InputContainer>
              <Label htmlFor="branchesDetails">
                Detalls de les sucursals *
              </Label>
              <Textarea
                id="branchesDetails"
                value={formData.branchesDetails || ''}
                onChange={e =>
                  handleInputChange('branchesDetails', e.target.value)
                }
                placeholder="Descripció detallada de les sucursals"
                rows={3}
                disabled={isViewing}
              />
            </InputContainer>
          )}

          <InputContainer>
            <Label className="text-sm font-medium">Matriu *</Label>
            <RadioGroup
              value={formData.isMainBranch}
              onValueChange={value => handleInputChange('isMainBranch', value)}
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="is-main-branch-yes" />
                <Label htmlFor="is-main-branch-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="is-main-branch-no" />
                <Label htmlFor="is-main-branch-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          {formData.isMainBranch === 'yes' && (
            <InputContainer>
              <Label htmlFor="mainBranchDetails">Detalls la matriu *</Label>
              <Textarea
                id="mainBranchDetails"
                value={formData.mainBranchDetails || ''}
                onChange={e =>
                  handleInputChange('mainBranchDetails', e.target.value)
                }
                placeholder="Descripció detallada de la matriu"
                rows={3}
                disabled={isViewing}
              />
            </InputContainer>
          )}

          <InputContainer>
            <Label className="text-sm font-medium">
              La societat cotitza en un mercat regulat? *
            </Label>
            <RadioGroup
              value={formData.isListedOnRegulatedMarket}
              onValueChange={value =>
                handleInputChange('isListedOnRegulatedMarket', value)
              }
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="yes"
                  id="is-listed-on-regulated-market-yes"
                />
                <Label htmlFor="is-listed-on-regulated-market-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="no"
                  id="is-listed-on-regulated-market-no"
                />
                <Label htmlFor="is-listed-on-regulated-market-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          {formData.isListedOnRegulatedMarket === 'yes' && (
            <InputContainer>
              <Label htmlFor="regulatedMarketDetails">Detalls *</Label>
              <Textarea
                id="regulatedMarketDetails"
                value={formData.regulatedMarketDetails || ''}
                onChange={e =>
                  handleInputChange('regulatedMarketDetails', e.target.value)
                }
                placeholder="Descripció detallada"
                rows={3}
                disabled={isViewing}
              />
            </InputContainer>
          )}
        </CardContent>
      </Card>

      {/* Business Purpose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center uppercase">
            <Handshake className="size-5 mr-2" />
            Propòsit i índole de la relació de negoci
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="businessPurpose"
            value={formData.businessPurpose || ''}
            onChange={e => handleInputChange('businessPurpose', e.target.value)}
            placeholder="Motiu pel que es constitueix societat a Andorra i/o de la relació de negoci amb Ancei Consultoria Estratègica Internacional SA"
            rows={4}
            disabled={isViewing}
          />
        </CardContent>
      </Card>

      {/* Management Members */}
      <Card>
        <CardHeader>
          <CardTitle>INFORMACIÓ SOBRE L’ÒRGAN D’ADMINISTRACIÓ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {managementMembers.map((member, index) => (
            <ManagementForm
              key={member.id}
              person={member}
              index={index}
              updatePerson={updatePerson}
              removePerson={removePerson}
              isViewing={isViewing}
            />
          ))}
          <Button
            onClick={() => addPerson('management')}
            variant="outline"
            className="w-full"
            disabled={isViewing}
          >
            <Plus className="w-4 h-4 mr-2" />
            Afegir Membre de la Administració
          </Button>
        </CardContent>
      </Card>

      {/* Shareholders */}
      <Card>
        <CardHeader>
          <CardTitle>INFORMACIÓ SOBRE ELS ACCIONISTES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shareholders.map((shareholder, index) => (
            <ShareholderForm
              key={shareholder.id}
              person={shareholder}
              index={index}
              updatePerson={updatePerson}
              removePerson={removePerson}
              isViewing={isViewing}
            />
          ))}
          <Button
            onClick={() => addPerson('shareholders')}
            variant="outline"
            className="w-full"
            disabled={isViewing}
          >
            <Plus className="w-4 h-4 mr-2" />
            Afegir Accionista
          </Button>
        </CardContent>
      </Card>

      {/* UBOs */}
      <Card>
        <CardHeader>
          <CardTitle>
            IDENTIFICACIÓ DELS BENEFICIARIS EFECTIUS O TITULARS REALS (UBO) (*)
          </CardTitle>
          <CardDescription>
            Identifiqueu els beneficiaris efectius o titulars reals de la
            persona jurídica intervinent (persona o persones físiques que, en
            últim terme, tinguin la propietat o el control de la persona
            jurídica):
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ubos.map((ubo, index) => (
            <UBOForm
              key={ubo.id}
              person={ubo}
              index={index}
              updatePerson={updatePerson}
              removePerson={removePerson}
              isViewing={isViewing}
            />
          ))}
          <Button
            onClick={() => addPerson('ubos')}
            variant="outline"
            className="w-full"
            disabled={isViewing}
          >
            <Plus className="w-4 h-4 mr-2" />
            Afegir UBO
          </Button>

          <div className="flex flex-col gap-1">
            <CardDescription className="text-xs">
              (*) Cada beneficiari efectiu o titular real diferent dels
              representants de la persona jurídica, ha d’emplenar i signar el
              seu respectiu formulari de coneixement del client de persones
              físiques (KYC).
            </CardDescription>
            <CardDescription className="text-xs">
              (**) Accionista, partícip, fundador, administrador, conseller
              delegat, secretari, apoderat, membre de la junta directiva, patró,
              protector, fideïcomitent o fideïcomissari.
            </CardDescription>
          </div>
        </CardContent>
      </Card>

      {/* Representative Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center uppercase">
            <IdCard className="size-5 mr-2" />
            DADES DEL REPRESENTANT DE LA SOCIETAT
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <InputContainer>
              <Label htmlFor="representativeFullName">Nom i Cognoms *</Label>
              <Input
                id="representativeFullName"
                value={formData.representativeFullName || ''}
                onChange={e =>
                  handleInputChange('representativeFullName', e.target.value)
                }
                placeholder="Nom i cognoms complets"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeDateOfBirth">
                Data de Naixement *
              </Label>
              <Input
                id="representativeDateOfBirth"
                type="date"
                value={formData.representativeDateOfBirth || ''}
                onChange={e =>
                  handleInputChange('representativeDateOfBirth', e.target.value)
                }
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeCountryOfBirth">
                País de Naixement *
              </Label>
              <Input
                id="representativeCountryOfBirth"
                value={formData.representativeCountryOfBirth || ''}
                onChange={e =>
                  handleInputChange(
                    'representativeCountryOfBirth',
                    e.target.value
                  )
                }
                placeholder="País de naixement"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeNationality">Nacionalitat *</Label>
              <Input
                id="representativeNationality"
                value={formData.representativeNationality || ''}
                onChange={e =>
                  handleInputChange('representativeNationality', e.target.value)
                }
                placeholder="Nacionalitat"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeDocumentType">
                Tipus de Document *
              </Label>
              <Select
                value={formData.representativeDocumentType || ''}
                onValueChange={value =>
                  handleInputChange('representativeDocumentType', value)
                }
                disabled={isViewing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipus de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dni">DNI</SelectItem>
                  <SelectItem value="passport">Passaport</SelectItem>
                </SelectContent>
              </Select>
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeDocumentNumber">
                Número de Document *
              </Label>
              <Input
                id="representativeDocumentNumber"
                value={formData.representativeDocumentNumber || ''}
                onChange={e =>
                  handleInputChange(
                    'representativeDocumentNumber',
                    e.target.value
                  )
                }
                placeholder="Número del document"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeGender">Gènere</Label>
              <Select
                value={formData.representativeGender || ''}
                onValueChange={value =>
                  handleInputChange('representativeGender', value)
                }
                disabled={isViewing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar gènere" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Dona</SelectItem>
                  <SelectItem value="male">Home</SelectItem>
                </SelectContent>
              </Select>
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeProfessionalActivity">
                Activitat professional
              </Label>
              <Select
                value={formData.representativeProfessionalActivity || ''}
                onValueChange={value =>
                  handleInputChange('representativeProfessionalActivity', value)
                }
                disabled={isViewing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar activitat professional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liberal_professional">
                    Professional liberal
                  </SelectItem>
                  <SelectItem value="employee">
                    Treballa per compte aliè
                  </SelectItem>
                  <SelectItem value="unemployed">No treballa</SelectItem>
                  <SelectItem value="business_owner">Empresari/a</SelectItem>
                  <SelectItem value="self_employed">Autònom/a</SelectItem>
                  <SelectItem value="receives_income">
                    Rep rendes públiques / privades
                  </SelectItem>
                  <SelectItem value="retired">
                    Jubilat/da que rep una pensió pública / privada
                  </SelectItem>
                </SelectContent>
              </Select>
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeProfession">
                Càrrec ocupat en l´activitat professional *
              </Label>
              <Input
                id="representativeProfession"
                value={formData.representativeProfession || ''}
                onChange={e =>
                  handleInputChange('representativeProfession', e.target.value)
                }
                placeholder="Càrrec ocupat"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeMaritalStatus">Estat Civil</Label>
              <Input
                id="representativeMaritalStatus"
                value={formData.representativeMaritalStatus || ''}
                onChange={e =>
                  handleInputChange(
                    'representativeMaritalStatus',
                    e.target.value
                  )
                }
                placeholder="Estat civil"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativePartnerFullName">
                Si escau, Nom i Cognoms de la parella
              </Label>
              <Input
                id="representativePartnerFullName"
                value={formData.representativePartnerFullName || ''}
                onChange={e =>
                  handleInputChange(
                    'representativePartnerFullName',
                    e.target.value
                  )
                }
                placeholder="Nom i Cognoms de la parella"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeMaritalEconomicRegime">
                Règim econòmic matrimonial
              </Label>
              <Select
                value={formData.representativeMaritalEconomicRegime || ''}
                onValueChange={value =>
                  handleInputChange(
                    'representativeMaritalEconomicRegime',
                    value
                  )
                }
                disabled={isViewing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar règim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="separation_of_property">
                    Separació de béns
                  </SelectItem>
                  <SelectItem value="community_property">
                    Béns ganancials
                  </SelectItem>
                </SelectContent>
              </Select>
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativePhone">Telèfon de contacte *</Label>
              <Input
                id="representativePhone"
                value={formData.representativePhone || ''}
                onChange={e =>
                  handleInputChange('representativePhone', e.target.value)
                }
                placeholder="+376 000000"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="representativeEmail">Correu electrònic *</Label>
              <Input
                id="representativeEmail"
                type="email"
                value={formData.representativeEmail || ''}
                onChange={e =>
                  handleInputChange('representativeEmail', e.target.value)
                }
                placeholder="correu@exemple.com"
                disabled={isViewing}
              />
            </InputContainer>
          </div>

          <Separator />

          <div className="flex items-start space-x-2">
            <Checkbox
              id="fundsNotFromMoneyLaundering"
              checked={formData.fundsNotFromMoneyLaundering || false}
              onCheckedChange={checked =>
                handleInputChange('fundsNotFromMoneyLaundering', checked)
              }
              disabled={isViewing}
            />
            <Label
              htmlFor="fundsNotFromMoneyLaundering"
              className="text-sm leading-relaxed"
            >
              El client manifesta i declara expressament que els fons utilitzats
              pel pagament dels serveis NO procedeixen d’una activitat
              relacionada amb l’activitat de blanqueig.
            </Label>
          </div>

          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="fundsSource"
                checked={formData.fundsSource || false}
                onCheckedChange={checked => {
                  handleInputChange('fundsSource', checked)
                  if (!checked) {
                    setFormData(prev => ({
                      ...prev,
                      fundsSourceDetails: ''
                    }))
                  }
                }}
                disabled={isViewing}
              />
              <Label htmlFor="fundsSource" className="text-sm leading-relaxed">
                El cient manifesta que els fons emprats pel pagament del serveis
                procedeixen de:
              </Label>
            </div>

            <Input
              id="fundsSourceDetails"
              disabled={!formData.fundsSource || isViewing}
              value={formData.fundsSourceDetails || ''}
              onChange={e =>
                handleInputChange('fundsSourceDetails', e.target.value)
              }
              placeholder="Descripció dels fons"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="actingOnOwnBehalf"
              checked={formData.actingOnOwnBehalf || false}
              onCheckedChange={checked =>
                handleInputChange('actingOnOwnBehalf', checked)
              }
              disabled={isViewing}
            />
            <Label
              htmlFor="actingOnOwnBehalf"
              className="text-sm leading-relaxed"
            >
              El client manifesta expressament que està actuant per compte propi
              i declara no estar actuant en nom, per compte o representació de
              tercers.
            </Label>
          </div>

          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="actingOnBehalfOfThirdParty"
                checked={formData.actingOnBehalfOfThirdParty || false}
                onCheckedChange={checked => {
                  handleInputChange('actingOnBehalfOfThirdParty', checked)
                  if (!checked) {
                    setFormData(prev => ({
                      ...prev,
                      thirdPartyRepresented: ''
                    }))
                  }
                }}
                disabled={isViewing}
              />
              <Label
                htmlFor="actingOnBehalfOfThirdParty"
                className="text-sm leading-relaxed"
              >
                El client manifesta expressament que està actuant per compte i
                representació d’un tercer. Tercer al que es representa:
              </Label>
            </div>

            <Input
              id="thirdPartyRepresented"
              disabled={!formData.actingOnBehalfOfThirdParty || isViewing}
              value={formData.thirdPartyRepresented || ''}
              onChange={e =>
                handleInputChange('thirdPartyRepresented', e.target.value)
              }
              placeholder="Representant"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <CardTitle className="flex items-baseline uppercase">
              Persona políticament exposada (PEP)
              <span className="normal-case font-normal text-xs">
                &nbsp;(marqui el que procedeixi)
              </span>
            </CardTitle>
            <CardDescription>
              Qualsevol beneficiari efectiu o titular real, representant o
              apoderat de la persona jurídica:
            </CardDescription>
          </div>

          <InputContainer>
            <Label className="text-sm font-medium">
              Desenvolupa o ha desenvolupat (**) alguna funció o càrrec
              rellevant de caràcter públic, judicial, polític, militar o a
              empreses públiques?
            </Label>
            <RadioGroup
              value={formData.hasHeldPublicFunction}
              onValueChange={value =>
                handleInputChange('hasHeldPublicFunction', value)
              }
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="has-held-public-function-yes" />
                <Label htmlFor="has-held-public-function-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="has-held-public-function-no" />
                <Label htmlFor="has-held-public-function-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <InputContainer>
            <Label className="text-sm font-medium">
              Desenvolupa o ha desenvolupat (**) el cònjuge del titular real (o
              persona assimilable al mateix), els seus fills o els cònjuges del
              seus fills (o persones assimilables als mateixos) o els seus pares
              alguna funció o càrrec rellevant de caràcter públic, judicial,
              polític, militar o a empreses públiques?
            </Label>
            <RadioGroup
              value={formData.familyHasHeldPublicFunction}
              onValueChange={value =>
                handleInputChange('familyHasHeldPublicFunction', value)
              }
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="yes"
                  id="family-has-held-public-function-yes"
                />
                <Label htmlFor="family-has-held-public-function-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="no"
                  id="family-has-held-public-function-no"
                />
                <Label htmlFor="family-has-held-public-function-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <InputContainer>
            <Label className="text-sm font-medium">
              Desenvolupa o ha desenvolupat (**) alguna persona afí al titular
              alguna funció o càrrec rellevant de caràcter públic, judicial,
              polític, militar o a empreses públiques?
            </Label>
            <RadioGroup
              value={formData.closePersonHasHeldPublicFunction}
              onValueChange={value =>
                handleInputChange('closePersonHasHeldPublicFunction', value)
              }
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="yes"
                  id="close-person-has-held-public-function-yes"
                />
                <Label htmlFor="close-person-has-held-public-function-yes">
                  Sí
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="no"
                  id="close-person-has-held-public-function-no"
                />
                <Label htmlFor="close-person-has-held-public-function-no">
                  No
                </Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <CardDescription className="text-xs">
            S'entén per persona afí al titular a qualsevol persona que, de
            manera notòria, participin en el control de entitats o estructures
            jurídiques conjuntament amb persones que exerceixin o hagin exercit
            una funció o càrrec rellevant de caràcter públic, judicial, polític,
            militar o a empreses públiques
          </CardDescription>

          <Label className="text-sm font-medium">
            Si alguna de les respostes ha estat SI, detallar el càrrec, les
            dates en les quals ho va exercir, el país on va exercir el càrrec i,
            si escau, la vinculació familiar o afí amb el declarant.
          </Label>

          {relatedPersons.map((person, index) => (
            <RelatedPersonForm
              key={index}
              person={person}
              index={index}
              updatePerson={updatePerson}
              removePerson={removePerson}
              isViewing={isViewing}
            />
          ))}

          <Button
            onClick={() => addPerson()}
            variant="outline"
            className="w-full"
            disabled={isViewing}
          >
            <Plus className="w-4 h-4 mr-2" />
            Afegir persona
          </Button>

          <div className="flex flex-col gap-1">
            <CardDescription className="text-xs">
              (*) Quan alguna persona estretament relacionada amb el client
              tingui la consideració de PEP, aquesta haurà d’emplenar un nou
              formulari de coneixement del client (KYC) de persones físiques. El
              client assumeix el compromís d’informar a Ancei Consultoria
              Estratègica Internacional SA de qualsevol modificació que es
              produeixi en relació a si té o no la condició de PEP.
            </CardDescription>
            <CardDescription className="text-xs">
              (**) No es considerarà que una persona pertany a l’àmbit polític
              quan hagués transcorregut més d´un (1) any des de la data en què
              hagués deixat formalment d’exercir qualsevol de les funcions
              anteriorment expressades.
            </CardDescription>
          </div>

          <Separator />

          <Label>
            Països i/o zones geogràfiques en les quals la persona jurídica
            exerceix les seves activitats
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {formData.activityRegions?.map((region, index) => (
              <div key={index} className="flex items-end gap-2">
                <InputContainer className="w-full">
                  <Label>{`Zona #${index + 1}`}</Label>
                  <Input
                    id={`activity-region-${index}`}
                    value={region}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        activityRegions: prev.activityRegions?.map(
                          (region, i) => (i === index ? e.target.value : region)
                        )
                      }))
                      setExistingData?.(prev => ({
                        ...prev,
                        activityRegions: prev.activityRegions?.map(
                          (region, i) => (i === index ? e.target.value : region)
                        )
                      }))
                    }}
                    placeholder="País o zona geogràfica"
                    disabled={isViewing}
                  />
                </InputContainer>

                {formData.activityRegions &&
                  formData.activityRegions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          activityRegions: prev.activityRegions?.filter(
                            (_, i) => i !== index
                          )
                        }))
                        setExistingData?.(prev => ({
                          ...prev,
                          activityRegions: prev.activityRegions?.filter(
                            (_, i) => i !== index
                          )
                        }))
                      }}
                      className="cursor-pointer"
                      disabled={isViewing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                activityRegions: [...(prev.activityRegions ?? []), '']
              }))
              setExistingData?.(prev => ({
                ...prev,
                activityRegions: [...(prev.activityRegions ?? []), '']
              }))
            }}
            disabled={isViewing}
          >
            <Plus className="h-4 w-4 mr-1" />
            Afegir país / zona
          </Button>

          <Separator />

          <InputContainer>
            <Label className="text-sm font-medium">
              És habitual i freqüent la utilització de diners en efectiu per
              part de la persona jurídica?
            </Label>
            <RadioGroup
              value={formData.cashUsage}
              onValueChange={value => handleInputChange('cashUsage', value)}
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="cash-usage-yes" />
                <Label htmlFor="cash-usage-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="cash-usage-no" />
                <Label htmlFor="cash-usage-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <InputContainer>
            <Label className="text-sm font-medium">
              La persona jurídica desenvolupa la seva activitat en algun dels
              sectors assenyalats a continuació?
            </Label>
            <RadioGroup
              value={formData.isRiskySector}
              onValueChange={value => handleInputChange('isRiskySector', value)}
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="risky-sector-yes" />
                <Label htmlFor="risky-sector-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="risky-sector-no" />
                <Label htmlFor="risky-sector-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <InputContainer>
            <Label className="text-xs font-medium mb-2 text-gray-400">
              Si la resposta ha estat afirmativa, marqui el que procedeixi?
            </Label>
            <RadioGroup
              disabled={
                !formData.isRiskySector ||
                formData.isRiskySector === 'no' ||
                isViewing
              }
              value={formData.riskySector}
              onValueChange={value => handleInputChange('riskySector', value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ecommerce" id="risky-sector-ecommerce" />
                <Label htmlFor="risky-sector-ecommerce">
                  Activitats relacionades amb sector informàtic / comerç
                  electrònic
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="crypto" id="risky-sector-crypto" />
                <Label htmlFor="risky-sector-crypto">
                  Utilització habitual de monedes virtuals
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gambling" id="risky-sector-gambling" />
                <Label htmlFor="risky-sector-gambling">
                  Casinos / apostes / loteries / jocs d’atzar
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="import_export"
                  id="risky-sector-import-export"
                />
                <Label htmlFor="risky-sector-import-export">
                  Comerç internacional (import/export)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jewelry" id="risky-sector-jewelry" />
                <Label htmlFor="risky-sector-jewelry">
                  Joieria / pedres i/o metalls preciosos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="art" id="risky-sector-art" />
                <Label htmlFor="risky-sector-art">
                  Objectes d’art / antiquari / brocanter
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="public_works"
                  id="risky-sector-public-works"
                />
                <Label htmlFor="risky-sector-public-works">
                  Obra civil o pública
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="military" id="risky-sector-military" />
                <Label htmlFor="risky-sector-military">
                  Indústria militar / armament
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="construction"
                  id="risky-sector-construction"
                />
                <Label htmlFor="risky-sector-construction">
                  Construcció / Promoció immobiliària
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mining" id="risky-sector-mining" />
                <Label htmlFor="risky-sector-mining">
                  Mineria / indústria extractiva
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="money_transfer"
                  id="risky-sector-money-transfer"
                />
                <Label htmlFor="risky-sector-money-transfer">
                  Enviament de diners / remeses / canvi de monedes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scrap" id="risky-sector-scrap" />
                <Label htmlFor="risky-sector-scrap">
                  Ferralla / desballestament
                </Label>
              </div>
            </RadioGroup>
          </InputContainer>
        </CardContent>
      </Card>

      {isOcicReview && (
        <>
          {/* Due Diligence Measures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center uppercase">
                <Shield className="size-5 mr-2" />
                Mesures de Diligència
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Assessment */}
              <InputContainer>
                <Label className="text-sm font-medium">
                  Valoració del Risc
                </Label>
                <RadioGroup
                  value={formData.riskLevel}
                  onValueChange={value => handleInputChange('riskLevel', value)}
                  className="flex gap-3 pt-2"
                  disabled={isViewing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="risk-low" />
                    <Label htmlFor="risk-low">Risc Baix</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="risk-medium" />
                    <Label htmlFor="risk-medium">Risc Mig</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="risk-high" />
                    <Label htmlFor="risk-high">Risc Alt</Label>
                  </div>
                </RadioGroup>
              </InputContainer>

              <Separator />

              <div className="flex flex-col md:flex-row gap-5">
                {/* Namebook */}
                <div className="flex flex-col md:flex-row items-center gap-5">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNamebookChecked"
                      checked={formData.isNamebookChecked || false}
                      onCheckedChange={checked => {
                        const newData = {
                          ...formData,
                          isNamebookChecked: checked as boolean,
                          namebookDate: checked ? formData.namebookDate : ''
                        }
                        setFormData(newData)
                        setExistingData?.(newData)
                      }}
                      disabled={isViewing}
                    />
                    <Label
                      htmlFor="isNamebookChecked"
                      className="text-sm font-medium"
                    >
                      Namebook
                    </Label>
                  </div>

                  <div className="flex gap-3 items-center">
                    <Label htmlFor="namebookDate">Data:</Label>
                    <Input
                      id="namebookDate"
                      type="date"
                      value={formData.namebookDate || ''}
                      onChange={e =>
                        handleInputChange('namebookDate', e.target.value)
                      }
                      disabled={!formData.isNamebookChecked || isViewing}
                    />
                  </div>
                </div>

                {/* Llistat ONU */}
                <div className="flex flex-col md:flex-row items-center gap-5">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOnuListChecked"
                      checked={formData.isOnuListChecked || false}
                      onCheckedChange={checked => {
                        const newData = {
                          ...formData,
                          isOnuListChecked: checked as boolean,
                          onuListDate: checked ? formData.onuListDate : ''
                        }
                        setFormData(newData)
                        setExistingData?.(newData)
                      }}
                      disabled={isViewing}
                    />
                    <Label
                      htmlFor="isOnuListChecked"
                      className="text-sm font-medium"
                    >
                      Llistat ONU
                    </Label>
                  </div>

                  <div className="flex gap-3 items-center">
                    <Label htmlFor="onuListDate">Data:</Label>
                    <Input
                      id="onuListDate"
                      type="date"
                      value={formData.onuListDate || ''}
                      onChange={e =>
                        handleInputChange('onuListDate', e.target.value)
                      }
                      disabled={!formData.isOnuListChecked || isViewing}
                    />
                  </div>
                </div>

                {/* Web */}
                <div className="flex flex-col md:flex-row items-center gap-5">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isWebChecked"
                      checked={formData.isWebChecked || false}
                      onCheckedChange={checked => {
                        const newData = {
                          ...formData,
                          isWebChecked: checked as boolean,
                          webDate: checked ? formData.webDate : ''
                        }
                        setFormData(newData)
                        setExistingData?.(newData)
                      }}
                      disabled={isViewing}
                    />
                    <Label
                      htmlFor="isWebChecked"
                      className="text-sm font-medium"
                    >
                      Web
                    </Label>
                  </div>

                  <div className="flex gap-3 items-center">
                    <Label htmlFor="webDate">Data:</Label>
                    <Input
                      id="webDate"
                      type="date"
                      value={formData.webDate || ''}
                      onChange={e =>
                        handleInputChange('webDate', e.target.value)
                      }
                      disabled={!formData.isWebChecked || isViewing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* OCIC Opinion */}
              <InputContainer>
                <Label className="text-sm font-medium">Opinió OCIC</Label>
                <RadioGroup
                  value={formData.ocicOpinion}
                  onValueChange={value =>
                    handleInputChange('ocicOpinion', value)
                  }
                  className="flex gap-3 pt-2"
                  disabled={isViewing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="favorable" id="ocic-favorable" />
                    <Label htmlFor="ocic-favorable">Favorable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unfavorable" id="ocic-unfavorable" />
                    <Label htmlFor="ocic-unfavorable">No Favorable</Label>
                  </div>
                </RadioGroup>
              </InputContainer>

              {/* OCIC Comments */}
              <InputContainer>
                <Label htmlFor="ocicComments">Comentaris OCIC</Label>
                <Textarea
                  id="ocicComments"
                  value={formData.ocicComments || ''}
                  onChange={e =>
                    handleInputChange('ocicComments', e.target.value)
                  }
                  placeholder="Escriu aquí els comentaris de l'OCIC..."
                  rows={4}
                  className="resize-none"
                  disabled={isViewing}
                />
              </InputContainer>
            </CardContent>
          </Card>
        </>
      )}

      {isClientSubmit && (
        <>
          {/* Declarations and Signature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Declaracions i Signatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="authorizedVerification"
                    checked={formData.authorizedVerification || false}
                    onCheckedChange={checked =>
                      handleInputChange('authorizedVerification', checked)
                    }
                  />
                  <Label
                    htmlFor="authorizedVerification"
                    className="text-sm leading-relaxed"
                  >
                    Que tota la informació subministrada en aquest formulari és
                    veraç i certa i AUTORITZO a Ancei Consultoria Estratègica
                    Internacional SA a verificar i, si escau, a ampliar aquestes
                    dades mitjançant les recerques i/o comprovacions que
                    consideri pertinents.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="noTaxProcedure"
                    checked={formData.noTaxProcedure || false}
                    onCheckedChange={checked =>
                      handleInputChange('noTaxProcedure', checked)
                    }
                  />
                  <Label
                    htmlFor="noTaxProcedure"
                    className="text-sm leading-relaxed"
                  >
                    Que no estic ni he estat part en cap procediment de
                    comprovació o inspecció tributària; en cas, d’estar-ho o
                    haver-ho estat, hem comprometo a aportar tota la
                    documentació relativa al mateix.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="legalFundsOrigin"
                    checked={formData.legalFundsOrigin || false}
                    onCheckedChange={checked =>
                      handleInputChange('legalFundsOrigin', checked)
                    }
                  />
                  <Label
                    htmlFor="legalFundsOrigin"
                    className="text-sm leading-relaxed"
                  >
                    Que els fons que pugui utilitzar per consumar qualsevol
                    transacció així com l’origen dels fons del meu patrimoni són
                    totalment lícits.
                  </Label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">
                  Signatura del Representant Legal
                </h4>
                {!representativeSignature ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Per completar el formulari, heu de proporcionar la vostra
                      signatura digital.
                    </p>
                    <Button
                      onClick={() => setShowSignaturePad(true)}
                      disabled={!hasDeclarations}
                      className="w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Signar Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-medium">
                        Document signat correctament
                      </p>
                      <p className="text-sm text-green-600">
                        Signatura capturada el{' '}
                        {new Date().toLocaleDateString('ca-ES')}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 bg-white">
                      <img
                        src={representativeSignature || '/placeholder.svg'}
                        alt="Signatura del client"
                        className="max-h-20"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setRepresentativeSignature(null)
                        setShowSignaturePad(true)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Tornar a Signar
                    </Button>
                  </div>
                )}
              </div>

              {showSignaturePad && (
                <div className="border-t pt-6">
                  <SignaturePad
                    onSignature={handleSignature}
                    signerName={
                      formData.representativeFullName || 'Representant Legal'
                    }
                    signerRole="Representant Legal - Persona Jurídica"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pb-8">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !representativeSignature}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Enviant...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar Formulari KYC
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </>
  )
}
