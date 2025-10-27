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
  IdCard,
  Handshake,
  Plus,
  Shield
} from 'lucide-react'
import { SignaturePad } from '@/components/signature-pad'
import { Separator } from '@/components/ui/separator'
import { InputContainer } from '@/components/input-container'
import { RelatedPersonForm } from '@/components/related-person-form'
import { v4 as uuidv4 } from 'uuid'
import type { FormRelatedPerson } from '@server/sharedTypes'
import type { KYCSession, KYCFormData } from '@/lib/types'
import { toast } from 'sonner'
import { base64ToFile, getFilledNameEntries } from '@/lib/utils'
import { uploadFiles } from '@/utils/uploadthing'
import {
  linkClientDocument,
  createKycDocument,
  createRelatedPersons,
  uploadClientDocument
} from '@/lib/api'
import { useNavigate } from '@tanstack/react-router'
import { Spinner } from './ui/spinner'

type Props = {
  clientData?: KYCFormData
  setClientData?: Dispatch<SetStateAction<KYCFormData>>
  clientRelatedPersons?: FormRelatedPerson[]
  setClientRelatedPersons?: Dispatch<SetStateAction<FormRelatedPerson[]>>
  kycSession?: KYCSession
  isViewing?: boolean
}

export const NaturalClientForm = ({
  clientData,
  setClientData,
  clientRelatedPersons,
  setClientRelatedPersons,
  kycSession,
  isViewing = false
}: Props) => {
  const navigate = useNavigate()
  const isClientSubmit = !clientData && !!kycSession
  const isOcicReview =
    clientData && clientData.status === 'compliance_reviewed' && !kycSession

  const [clientSignature, setClientSignature] = useState<string | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<KYCFormData>({
    // Personal Information
    fullName: '',
    birthDate: '',
    birthCountry: '',
    nationality: '',
    documentType: '',
    documentNumber: '',
    gender: '',
    professionalActivity: '',
    profession: '',
    maritalStatus: '',
    partnerFullName: '',
    maritalEconomicRegime: '',
    phone: '',
    email: '',

    // Declarations 1
    fundsNotFromMoneyLaundering: false,
    fundsSource: false,
    fundsSourceDetails: '',
    actingOnOwnBehalf: false,
    actingOnBehalfOfThirdParty: false,
    thirdPartyRepresented: '',

    // Addresses
    fiscalAddress: '',
    fiscalCity: '',
    fiscalPostalCode: '',
    fiscalCountry: '',
    postalAddress: '',
    postalCity: '',
    postalPostalCode: '',
    postalCountry: '',

    // Business Purpose
    businessPurpose: '',
    cashUsage: '',
    isRiskySector: '',
    riskySector: '',
    isPEP: '',
    isSelfExposed: '',
    isFamilyExposed: '',
    isAssociatesExposed: '',

    // Declarations 2
    authorizedVerification: false,
    noTaxProcedure: false,
    legalFundsOrigin: false
  })

  const [relatedPersons, setRelatedPersons] = useState<FormRelatedPerson[]>([])

  const updateRelatedPerson = (id: string, field: string, value: string) => {
    const updatedPersons = relatedPersons.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    )
    setRelatedPersons(updatedPersons)
    setClientRelatedPersons?.(updatedPersons)
  }

  const removeRelatedPerson = (id: string) => {
    setRelatedPersons(prev => prev.filter(p => p.id !== id))
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    const newData = {
      ...formData,
      [field]: value
    }
    setFormData(newData)

    // Sync to parent if available
    setClientData?.(newData)
  }

  const hasDeclarations =
    formData.authorizedVerification &&
    formData.noTaxProcedure &&
    formData.legalFundsOrigin

  const isFormValid = () => {
    const requiredFields = [
      'fullName',
      'birthDate',
      'birthCountry',
      'nationality',
      'documentType',
      'documentNumber',
      'profession',
      'phone',
      'email',
      'fiscalAddress',
      'fiscalCity',
      'fiscalCountry'
    ]

    const hasRequiredFields = requiredFields.every(
      field => formData[field as keyof typeof formData]
    )

    return hasRequiredFields && hasDeclarations
  }

  const handleSubmit = async () => {
    if (!kycSession || !clientSignature) return

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
      const signatureFile = base64ToFile(clientSignature)

      const fileInfo = await uploadFiles('blobUploader', {
        files: [signatureFile]
      })

      const signature = await uploadClientDocument({
        clientId: kycSession.clientId,
        value: {
          name: 'Signatura client',
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
    setClientSignature(signature)
    setShowSignaturePad(false)
  }

  useEffect(() => {
    if (!clientData || !clientRelatedPersons) return

    setFormData(clientData)
    setRelatedPersons(clientRelatedPersons)
  }, [clientData, clientRelatedPersons])

  useEffect(() => {
    if (!kycSession) return

    setFormData(prev => ({
      ...prev,
      fullName: kycSession.clientName || '',
      email: kycSession.clientEmail || '',
      phone: kycSession.clientPhone || ''
    }))
  }, [kycSession])

  useEffect(() => {
    if (formData.isRiskySector === 'yes' || !formData.isRiskySector) return

    setFormData(prev => ({
      ...prev,
      riskySector: ''
    }))
    setClientData?.(prev => ({
      ...prev,
      riskySector: ''
    }))
  }, [formData.isRiskySector, setClientData])

  return (
    <>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center uppercase">
            <IdCard className="size-5 mr-2" />
            Dades Personals
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <InputContainer>
              <Label htmlFor="fullName">Nom i Cognoms *</Label>
              <Input
                id="fullName"
                value={formData.fullName || ''}
                onChange={e => handleInputChange('fullName', e.target.value)}
                placeholder="Nom i cognoms complets"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="birthDate">Data de Naixement *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate || ''}
                onChange={e => handleInputChange('birthDate', e.target.value)}
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="birthCountry">País de Naixement *</Label>
              <Input
                id="birthCountry"
                value={formData.birthCountry || ''}
                onChange={e =>
                  handleInputChange('birthCountry', e.target.value)
                }
                placeholder="País de naixement"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="nationality">Nacionalitat *</Label>
              <Input
                id="nationality"
                value={formData.nationality || ''}
                onChange={e => handleInputChange('nationality', e.target.value)}
                placeholder="Nacionalitat"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="documentType">Tipus de Document *</Label>
              <Select
                value={formData.documentType || ''}
                onValueChange={value =>
                  handleInputChange('documentType', value)
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
              <Label htmlFor="documentNumber">Número de Document *</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber || ''}
                onChange={e =>
                  handleInputChange('documentNumber', e.target.value)
                }
                placeholder="Número del document"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="gender">Gènere</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={value => handleInputChange('gender', value)}
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
              <Label htmlFor="professionalActivity">
                Activitat professional
              </Label>
              <Select
                value={formData.professionalActivity || ''}
                onValueChange={value =>
                  handleInputChange('professionalActivity', value)
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
              <Label htmlFor="profession">
                Càrrec ocupat en l´activitat professional *
              </Label>
              <Input
                id="profession"
                value={formData.profession || ''}
                onChange={e => handleInputChange('profession', e.target.value)}
                placeholder="Càrrec ocupat"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="maritalStatus">Estat Civil</Label>
              <Input
                id="maritalStatus"
                value={formData.maritalStatus || ''}
                onChange={e =>
                  handleInputChange('maritalStatus', e.target.value)
                }
                placeholder="Estat civil"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="partnerFullName">
                Si escau, Nom i Cognoms de la parella
              </Label>
              <Input
                id="partnerFullName"
                value={formData.partnerFullName || ''}
                onChange={e =>
                  handleInputChange('partnerFullName', e.target.value)
                }
                placeholder="Nom i Cognoms de la parella"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="maritalEconomicRegime">
                Règim econòmic matrimonial
              </Label>
              <Select
                value={formData.maritalEconomicRegime || ''}
                onValueChange={value =>
                  handleInputChange('maritalEconomicRegime', value)
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
              <Label htmlFor="phone">Telèfon de contacte *</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="+376 000000"
                disabled={isViewing}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="email">Correu electrònic *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="correu@exemple.com"
                disabled={isViewing}
              />
            </InputContainer>
          </div>
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

      {/* Declarations */}
      <Card>
        <CardContent className="space-y-6">
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
        <CardContent className="space-y-6">
          <Textarea
            id="businessPurpose"
            value={formData.businessPurpose || ''}
            onChange={e => handleInputChange('businessPurpose', e.target.value)}
            placeholder="Motiu pel que es constitueix societat a Andorra i/o de la relació de negoci amb Ancei Consultoria Estratègica Internacional SA"
            rows={4}
            disabled={isViewing}
          />

          <InputContainer>
            <Label className="text-sm font-medium">
              És habitual i freqüent la utilització de diners en efectiu a la
              vostra activitat professional / laboral?
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
              Desenvolupa la seva activitat professional / laboral en algun dels
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

          <Separator />

          <InputContainer>
            <Label className="text-sm font-medium">
              És vostè una persona políticament exposada (PEP)? (*)
            </Label>
            <RadioGroup
              value={formData.isPEP}
              onValueChange={value => handleInputChange('isPEP', value)}
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pep-yes" />
                <Label htmlFor="pep-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pep-no" />
                <Label htmlFor="pep-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <InputContainer>
            <Label className="text-sm font-medium">
              Desenvolupa o ha desenvolupat (**) alguna funció o càrrec
              rellevant de caràcter públic, judicial, polític, militar o a
              empreses públiques?
            </Label>
            <RadioGroup
              value={formData.isSelfExposed}
              onValueChange={value => handleInputChange('isSelfExposed', value)}
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="self-exposed-yes" />
                <Label htmlFor="self-exposed-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="self-exposed-no" />
                <Label htmlFor="self-exposed-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <InputContainer>
            <Label className="text-sm font-medium">
              Desenvolupa o ha desenvolupat (**) el seu cònjuge (o persona
              assimilable al mateix), els seus fills o els cònjuges del seus
              fills (o persones assimilables als mateixos) o els seus pares
              alguna funció o càrrec rellevant de caràcter públic, judicial,
              polític, militar o a empreses públiques?
            </Label>
            <RadioGroup
              value={formData.isFamilyExposed}
              onValueChange={value =>
                handleInputChange('isFamilyExposed', value)
              }
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="family-exposed-yes" />
                <Label htmlFor="family-exposed-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="family-exposed-no" />
                <Label htmlFor="family-exposed-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <InputContainer>
            <Label className="text-sm font-medium">
              Desenvolupa o ha desenvolupat (**) alguna persona afí al declarant
              alguna funció o càrrec rellevant de caràcter públic, judicial,
              polític, militar o a empreses públiques?
            </Label>
            <RadioGroup
              value={formData.isAssociatesExposed}
              onValueChange={value =>
                handleInputChange('isAssociatesExposed', value)
              }
              disabled={isViewing}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="associates-exposed-yes" />
                <Label htmlFor="associates-exposed-yes">Sí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="associates-exposed-no" />
                <Label htmlFor="associates-exposed-no">No</Label>
              </div>
            </RadioGroup>
          </InputContainer>

          <CardDescription className="text-xs">
            S'entén per persona afí al declarant a qualsevol persona que, de
            manera notòria, participi en el control d´entitats o estructures
            jurídiques conjuntament amb persones que exerceixin o hagin exercit
            una funció o càrrec rellevant de caràcter públic, judicial, polític,
            militar o a empreses públiques.
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
              updatePerson={updateRelatedPerson}
              removePerson={removeRelatedPerson}
              isViewing={isViewing}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setRelatedPersons([
                ...relatedPersons,
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
            disabled={isViewing}
          >
            <Plus className="h-4 w-4 mr-1" />
            Afegir Persona
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
                        setClientData?.(newData)
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
                        setClientData?.(newData)
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
                        setClientData?.(newData)
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
                  Signatura Digital Requerida
                </h4>
                {!clientSignature ? (
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
                        Signatura capturada el {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 bg-white">
                      <img
                        src={clientSignature || '/placeholder.svg'}
                        alt="Signatura del client"
                        className="max-h-20"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setClientSignature(null)
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
                    signerName={formData.fullName || 'Client'}
                    signerRole="Persona Física"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pb-8">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !clientSignature}
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
