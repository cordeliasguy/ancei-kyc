import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  FileText,
  Send,
  AlertCircle,
  MapPinHouse,
  IdCard,
  Handshake,
  Plus
} from 'lucide-react'
import { SignaturePad } from '@/components/signature-pad'
import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { InputContainer } from '@/components/input-container'
import { RelatedPersonForm } from '@/components/related-person-form'
import { nanoid } from 'nanoid'
import type { LegalPersonType } from '@/lib/types'

export const Route = createFileRoute('/client/natural/')({
  component: NaturalPersonKYCForm
})

function NaturalPersonKYCForm() {
  const [kycSession, setKycSession] = useState<any>(null)
  const [formData, setFormData] = useState({
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
    relatedPersons: [
      {
        id: nanoid(),
        fullName: '',
        position: '',
        period: '',
        country: '',
        relationship: ''
      }
    ],

    // Declarations 2
    authorizedVerification: false,
    noTaxProcedure: false,
    legalFundsOrigin: false
  })

  const [clientSignature, setClientSignature] = useState<string | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load KYC session data
    const sessionData = sessionStorage.getItem('clientSession')
    console.log(sessionData)

    if (sessionData) {
      const session = JSON.parse(sessionData)
      setKycSession(session)

      // Pre-fill form with client information if available
      if (session) {
        setFormData(prev => ({
          ...prev,
          fullName: session.clientName || '',
          email: session.clientEmail || ''
        }))
      }
    } else {
      // Redirect to home if no session
      alert(
        "No s'ha trobat una sessió KYC vàlida. Si us plau, torneu a començar."
      )
      window.location.href = '/'
    }
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-fill residence address if same as fiscal
    if (field === 'sameAddress' && value) {
      setFormData(prev => ({
        ...prev,
        residenceAddress: prev.fiscalAddress,
        residenceCity: prev.fiscalCity,
        residencePostalCode: prev.fiscalPostalCode,
        residenceCountry: prev.fiscalCountry
      }))
    }
  }

  const hasDeclarations =
    formData.authorizedVerification &&
    formData.noTaxProcedure &&
    formData.legalFundsOrigin

  const isFormValid = () => {
    const requiredFields = [
      'fullName',
      'birthDate',
      'birthPlace',
      'birthCountry',
      'nationality',
      'documentType',
      'documentNumber',
      'phone',
      'email',
      'fiscalAddress',
      'fiscalCity',
      'fiscalCountry',
      'profession',
      'businessPurpose',
      'fundsOrigin'
    ]

    const hasRequiredFields = requiredFields.every(
      field => formData[field as keyof typeof formData]
    )

    return hasRequiredFields && hasDeclarations && clientSignature
  }

  const handleSubmit = () => {
    if (!isFormValid()) {
      alert(
        'Si us plau, completeu tots els camps obligatoris i signeu el document'
      )
      return
    }

    setIsSubmitting(true)

    // Create submission data with client linking
    // const submissionData = {
    //   ...formData,
    //   clientCode: kycSession?.clientCode,
    //   serviceType: kycSession?.serviceType,
    //   clientSignature,
    //   submissionDate: new Date().toISOString(),
    //   consultancy: kycSession?.clientInfo?.consultancy
    // }

    // Mock submission
    setTimeout(() => {
      alert(
        'Formulari enviat correctament! Rebreu una confirmació per correu electrònic.'
      )
      // Clear session
      localStorage.removeItem('clientSession')
      window.location.href = '/'
    }, 2000)
  }

  const handleSignature = (signature: string) => {
    setClientSignature(signature)
    setShowSignaturePad(false)
  }

  const updatePerson = (
    type: LegalPersonType | 'related',
    id: string,
    field: string,
    value: string
  ) => {
    if (type === 'related') {
      setFormData(prev => ({
        ...prev,
        relatedPersons: prev.relatedPersons.map(p =>
          p.id === id ? { ...p, [field]: value } : p
        )
      }))
    }
  }

  const removePerson = (type: LegalPersonType | 'related', id: string) => {
    if (type === 'related') {
      setFormData(prev => ({
        ...prev,
        relatedPersons: prev.relatedPersons.filter(p => p.id !== id)
      }))
    }
  }

  if (!kycSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">Carregant sessió...</h2>
            <p className="text-gray-600">
              Si us plau, espereu mentre validem la vostra sessió KYC.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = '/')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tornar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Formulari KYC - Persona Física
              </h1>
              <p className="text-gray-600">
                Coneixement del Client per a persones físiques
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information Banner */}
      <div className="bg-blue-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Client: {kycSession.clientCode}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  Servei: {kycSession.serviceType}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{kycSession.clientName}</span>
                <span className="mx-2">•</span>
                <span>{kycSession.consultancy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
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
                    value={formData.fullName}
                    onChange={e =>
                      handleInputChange('fullName', e.target.value)
                    }
                    placeholder="Nom i cognoms complets"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="birthDate">Data de Naixement *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={e =>
                      handleInputChange('birthDate', e.target.value)
                    }
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="birthCountry">País de Naixement *</Label>
                  <Input
                    id="birthCountry"
                    value={formData.birthCountry}
                    onChange={e =>
                      handleInputChange('birthCountry', e.target.value)
                    }
                    placeholder="País de naixement"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="nationality">Nacionalitat *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={e =>
                      handleInputChange('nationality', e.target.value)
                    }
                    placeholder="Nacionalitat"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="documentType">Tipus de Document *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={value =>
                      handleInputChange('documentType', value)
                    }
                  >
                    <SelectTrigger>
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
                    value={formData.documentNumber}
                    onChange={e =>
                      handleInputChange('documentNumber', e.target.value)
                    }
                    placeholder="Número del document"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="gender">Gènere</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={value => handleInputChange('gender', value)}
                  >
                    <SelectTrigger>
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
                    value={formData.professionalActivity}
                    onValueChange={value =>
                      handleInputChange('professionalActivity', value)
                    }
                  >
                    <SelectTrigger>
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
                      <SelectItem value="business_owner">
                        Empresari/a
                      </SelectItem>
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
                    value={formData.profession}
                    onChange={e =>
                      handleInputChange('profession', e.target.value)
                    }
                    placeholder="Càrrec ocupat"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="maritalStatus">Estat Civil</Label>
                  <Input
                    id="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={e =>
                      handleInputChange('maritalStatus', e.target.value)
                    }
                    placeholder="Estat civil"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="partnerFullName">
                    Si escau, Nom i Cognoms de la parella
                  </Label>
                  <Input
                    id="partnerFullName"
                    value={formData.partnerFullName}
                    onChange={e =>
                      handleInputChange('partnerFullName', e.target.value)
                    }
                    placeholder="Nom i Cognoms de la parella"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="maritalEconomicRegime">
                    Règim econòmic matrimonial
                  </Label>
                  <Select
                    value={formData.maritalEconomicRegime}
                    onValueChange={value =>
                      handleInputChange('maritalEconomicRegime', value)
                    }
                  >
                    <SelectTrigger>
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
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="+376 000000"
                  />
                </InputContainer>

                <InputContainer>
                  <Label htmlFor="email">Correu electrònic *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="correu@exemple.com"
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
                <h4 className="font-semibold mb-4 uppercase">
                  Domicili Fiscal
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputContainer className="md:col-span-2">
                    <Label htmlFor="fiscalAddress">Adreça *</Label>
                    <Input
                      id="fiscalAddress"
                      value={formData.fiscalAddress}
                      onChange={e =>
                        handleInputChange('fiscalAddress', e.target.value)
                      }
                      placeholder="Carrer, número, pis, porta"
                    />
                  </InputContainer>

                  <InputContainer>
                    <Label htmlFor="fiscalPostalCode">Codi Postal</Label>
                    <Input
                      id="fiscalPostalCode"
                      value={formData.fiscalPostalCode}
                      onChange={e =>
                        handleInputChange('fiscalPostalCode', e.target.value)
                      }
                      placeholder="08000"
                    />
                  </InputContainer>

                  <InputContainer>
                    <Label htmlFor="fiscalCity">Localitat *</Label>
                    <Input
                      id="fiscalCity"
                      value={formData.fiscalCity}
                      onChange={e =>
                        handleInputChange('fiscalCity', e.target.value)
                      }
                      placeholder="Localitat"
                    />
                  </InputContainer>

                  <InputContainer>
                    <Label htmlFor="fiscalCountry">País *</Label>
                    <Input
                      id="fiscalCountry"
                      value={formData.fiscalCountry}
                      onChange={e =>
                        handleInputChange('fiscalCountry', e.target.value)
                      }
                      placeholder="Espanya"
                    />
                  </InputContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">
                  <span className="uppercase">Domicili Postal</span>, si
                  difereix del fiscal
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputContainer className="md:col-span-2">
                    <Label htmlFor="postalAddress">Adreça</Label>
                    <Input
                      id="postalAddress"
                      value={formData.postalAddress}
                      onChange={e =>
                        handleInputChange('postalAddress', e.target.value)
                      }
                      placeholder="Carrer, número, pis, porta"
                    />
                  </InputContainer>

                  <InputContainer>
                    <Label htmlFor="postalPostalCode">Codi Postal</Label>
                    <Input
                      id="postalPostalCode"
                      value={formData.postalPostalCode}
                      onChange={e =>
                        handleInputChange('postalPostalCode', e.target.value)
                      }
                      placeholder="08000"
                    />
                  </InputContainer>

                  <InputContainer>
                    <Label htmlFor="postalCity">Localitat</Label>
                    <Input
                      id="postalCity"
                      value={formData.postalCity}
                      onChange={e =>
                        handleInputChange('postalCity', e.target.value)
                      }
                      placeholder="Localitat"
                    />
                  </InputContainer>

                  <InputContainer>
                    <Label htmlFor="postalCountry">País</Label>
                    <Input
                      id="postalCountry"
                      value={formData.postalCountry}
                      onChange={e =>
                        handleInputChange('postalCountry', e.target.value)
                      }
                      placeholder="Espanya"
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
                  checked={formData.fundsNotFromMoneyLaundering}
                  onCheckedChange={checked =>
                    handleInputChange('fundsNotFromMoneyLaundering', checked)
                  }
                />
                <Label
                  htmlFor="fundsNotFromMoneyLaundering"
                  className="text-sm leading-relaxed"
                >
                  El client manifesta i declara expressament que els fons
                  utilitzats pel pagament dels serveis NO procedeixen d’una
                  activitat relacionada amb l’activitat de blanqueig.
                </Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="fundsSource"
                    checked={formData.fundsSource}
                    onCheckedChange={checked => {
                      handleInputChange('fundsSource', checked)
                      if (!checked) {
                        setFormData(prev => ({
                          ...prev,
                          fundsSourceDetails: ''
                        }))
                      }
                    }}
                  />
                  <Label
                    htmlFor="fundsSource"
                    className="text-sm leading-relaxed"
                  >
                    El cient manifesta que els fons emprats pel pagament del
                    serveis procedeixen de:
                  </Label>
                </div>

                <Input
                  id="fundsSourceDetails"
                  disabled={!formData.fundsSource}
                  value={formData.fundsSourceDetails}
                  onChange={e =>
                    handleInputChange('fundsSourceDetails', e.target.value)
                  }
                  placeholder="Descripció dels fons"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="actingOnOwnBehalf"
                  checked={formData.actingOnOwnBehalf}
                  onCheckedChange={checked =>
                    handleInputChange('actingOnOwnBehalf', checked)
                  }
                />
                <Label
                  htmlFor="actingOnOwnBehalf"
                  className="text-sm leading-relaxed"
                >
                  El client manifesta expressament que està actuant per compte
                  propi i declara no estar actuant en nom, per compte o
                  representació de tercers.
                </Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="actingOnBehalfOfThirdParty"
                    checked={formData.actingOnBehalfOfThirdParty}
                    onCheckedChange={checked => {
                      handleInputChange('actingOnBehalfOfThirdParty', checked)
                      if (!checked) {
                        setFormData(prev => ({
                          ...prev,
                          thirdPartyRepresented: ''
                        }))
                      }
                    }}
                  />
                  <Label
                    htmlFor="actingOnBehalfOfThirdParty"
                    className="text-sm leading-relaxed"
                  >
                    El client manifesta expressament que està actuant per compte
                    i representació d’un tercer. Tercer al que es representa:
                  </Label>
                </div>

                <Input
                  id="thirdPartyRepresented"
                  disabled={!formData.actingOnBehalfOfThirdParty}
                  value={formData.thirdPartyRepresented}
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
                value={formData.businessPurpose}
                onChange={e =>
                  handleInputChange('businessPurpose', e.target.value)
                }
                placeholder="Motiu pel que es constitueix societat a Andorra i/o de la relació de negoci amb Ancei Consultoria Estratègica Internacional SA"
                rows={4}
              />

              <InputContainer>
                <Label className="text-sm font-medium">
                  És habitual i freqüent la utilització de diners en efectiu a
                  la vostra activitat professional / laboral?
                </Label>
                <RadioGroup
                  value={formData.cashUsage}
                  onValueChange={value => handleInputChange('cashUsage', value)}
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
                  Desenvolupa la seva activitat professional / laboral en algun
                  dels sectors assenyalats a continuació?
                </Label>
                <RadioGroup
                  value={formData.isRiskySector}
                  onValueChange={value => {
                    handleInputChange('isRiskySector', value)
                    if (value === 'no') handleInputChange('riskySector', '')
                  }}
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
                    !formData.isRiskySector || formData.isRiskySector === 'no'
                  }
                  value={formData.riskySector}
                  onValueChange={value =>
                    handleInputChange('riskySector', value)
                  }
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="ecommerce"
                      id="risky-sector-ecommerce"
                    />
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
                    <RadioGroupItem
                      value="gambling"
                      id="risky-sector-gambling"
                    />
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
                    <RadioGroupItem
                      value="military"
                      id="risky-sector-military"
                    />
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
                  onValueChange={value =>
                    handleInputChange('isSelfExposed', value)
                  }
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
                  Desenvolupa o ha desenvolupat (**) alguna persona afí al
                  declarant alguna funció o càrrec rellevant de caràcter públic,
                  judicial, polític, militar o a empreses públiques?
                </Label>
                <RadioGroup
                  value={formData.isAssociatesExposed}
                  onValueChange={value =>
                    handleInputChange('isAssociatesExposed', value)
                  }
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

              <p className="text-xs text-gray-400">
                S'entén per persona afí al declarant a qualsevol persona que, de
                manera notòria, participi en el control d´entitats o estructures
                jurídiques conjuntament amb persones que exerceixin o hagin
                exercit una funció o càrrec rellevant de caràcter públic,
                judicial, polític, militar o a empreses públiques.
              </p>

              <Label className="text-sm font-medium">
                Si alguna de les respostes ha estat SI, detallar el càrrec, les
                dates en les quals ho va exercir, el país on va exercir el
                càrrec i, si escau, la vinculació familiar o afí amb el
                declarant.
              </Label>

              {formData.relatedPersons.map((person, index) => (
                <RelatedPersonForm
                  key={index}
                  person={person}
                  index={index}
                  updatePerson={updatePerson}
                  totalPersons={formData.relatedPersons.length}
                  removePerson={removePerson}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    relatedPersons: [
                      ...prev.relatedPersons,
                      {
                        id: nanoid(),
                        fullName: '',
                        position: '',
                        period: '',
                        country: '',
                        relationship: ''
                      }
                    ]
                  }))
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Afegir Persona
              </Button>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">
                  (*) Quan alguna persona estretament relacionada amb el client
                  tingui la consideració de PEP, aquesta haurà d’emplenar un nou
                  formulari de coneixement del client (KYC) de persones
                  físiques. El client assumeix el compromís d’informar a Ancei
                  Consultoria Estratègica Internacional SA de qualsevol
                  modificació que es produeixi en relació a si té o no la
                  condició de PEP.
                </p>

                <p className="text-xs text-gray-400">
                  (**) No es considerarà que una persona pertany a l’àmbit
                  polític quan hagués transcorregut més d´un (1) any des de la
                  data en què hagués deixat formalment d’exercir qualsevol de
                  les funcions anteriorment expressades.
                </p>
              </div>
            </CardContent>
          </Card>

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
                    checked={formData.authorizedVerification}
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
                    checked={formData.noTaxProcedure}
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
                    checked={formData.legalFundsOrigin}
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
                        Signatura capturada el{' '}
                        {new Date().toLocaleDateString('ca-ES')}
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
              disabled={!isFormValid() || isSubmitting}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? (
                'Enviant...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Formulari KYC
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
