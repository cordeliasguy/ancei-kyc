import { useState, type Dispatch, type SetStateAction } from 'react'
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
import {
  FileText,
  Send,
  MapPinHouse,
  IdCard,
  Handshake,
  Plus
} from 'lucide-react'
import { SignaturePad } from '@/components/signature-pad'
import { Separator } from '@/components/ui/separator'
import { InputContainer } from '@/components/input-container'
import { RelatedPersonForm } from '@/components/related-person-form'
import { nanoid } from 'nanoid'
import type { LegalPersonType, NaturalClient } from '@/lib/types'

type Props = {
  clientData: NaturalClient
  setClientData: Dispatch<SetStateAction<NaturalClient>>
}

export const NaturalClientForm = ({ clientData, setClientData }: Props) => {
  const [clientSignature, setClientSignature] = useState<string | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-fill residence address if same as fiscal
    if (field === 'sameAddress' && value) {
      setClientData(prev => ({
        ...prev,
        residenceAddress: prev.fiscalAddress,
        residenceCity: prev.fiscalCity,
        residencePostalCode: prev.fiscalPostalCode,
        residenceCountry: prev.fiscalCountry
      }))
    }
  }

  const hasDeclarations =
    clientData.authorizedVerification &&
    clientData.noTaxProcedure &&
    clientData.legalFundsOrigin

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
      field => clientData[field as keyof typeof clientData]
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
    //   ...clientData,
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
      setClientData(prev => ({
        ...prev,
        relatedPersons: prev.relatedPersons.map(p =>
          p.id === id ? { ...p, [field]: value } : p
        )
      }))
    }
  }

  const removePerson = (type: LegalPersonType | 'related', id: string) => {
    if (type === 'related') {
      setClientData(prev => ({
        ...prev,
        relatedPersons: prev.relatedPersons.filter(p => p.id !== id)
      }))
    }
  }

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
                value={clientData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                placeholder="Nom i cognoms complets"
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="birthDate">Data de Naixement *</Label>
              <Input
                id="birthDate"
                type="date"
                value={clientData.birthDate}
                onChange={e => handleInputChange('birthDate', e.target.value)}
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="birthCountry">País de Naixement *</Label>
              <Input
                id="birthCountry"
                value={clientData.birthCountry}
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
                value={clientData.nationality}
                onChange={e => handleInputChange('nationality', e.target.value)}
                placeholder="Nacionalitat"
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="documentType">Tipus de Document *</Label>
              <Select
                value={clientData.documentType}
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
                value={clientData.documentNumber}
                onChange={e =>
                  handleInputChange('documentNumber', e.target.value)
                }
                placeholder="Número del document"
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="gender">Gènere</Label>
              <Select
                value={clientData.gender}
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
                value={clientData.professionalActivity}
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
                value={clientData.profession}
                onChange={e => handleInputChange('profession', e.target.value)}
                placeholder="Càrrec ocupat"
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="maritalStatus">Estat Civil</Label>
              <Input
                id="maritalStatus"
                value={clientData.maritalStatus}
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
                value={clientData.partnerFullName}
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
                value={clientData.maritalEconomicRegime}
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
                value={clientData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="+376 000000"
              />
            </InputContainer>

            <InputContainer>
              <Label htmlFor="email">Correu electrònic *</Label>
              <Input
                id="email"
                type="email"
                value={clientData.email}
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
            <h4 className="font-semibold mb-4 uppercase">Domicili Fiscal</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <InputContainer className="md:col-span-2">
                <Label htmlFor="fiscalAddress">Adreça *</Label>
                <Input
                  id="fiscalAddress"
                  value={clientData.fiscalAddress}
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
                  value={clientData.fiscalPostalCode}
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
                  value={clientData.fiscalCity}
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
                  value={clientData.fiscalCountry}
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
              <span className="uppercase">Domicili Postal</span>, si difereix
              del fiscal
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <InputContainer className="md:col-span-2">
                <Label htmlFor="postalAddress">Adreça</Label>
                <Input
                  id="postalAddress"
                  value={clientData.postalAddress}
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
                  value={clientData.postalPostalCode}
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
                  value={clientData.postalCity}
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
                  value={clientData.postalCountry}
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
              checked={clientData.fundsNotFromMoneyLaundering}
              onCheckedChange={checked =>
                handleInputChange('fundsNotFromMoneyLaundering', checked)
              }
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
                checked={clientData.fundsSource}
                onCheckedChange={checked => {
                  handleInputChange('fundsSource', checked)
                  if (!checked) {
                    setClientData(prev => ({
                      ...prev,
                      fundsSourceDetails: ''
                    }))
                  }
                }}
              />
              <Label htmlFor="fundsSource" className="text-sm leading-relaxed">
                El cient manifesta que els fons emprats pel pagament del serveis
                procedeixen de:
              </Label>
            </div>

            <Input
              id="fundsSourceDetails"
              disabled={!clientData.fundsSource}
              value={clientData.fundsSourceDetails}
              onChange={e =>
                handleInputChange('fundsSourceDetails', e.target.value)
              }
              placeholder="Descripció dels fons"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="actingOnOwnBehalf"
              checked={clientData.actingOnOwnBehalf}
              onCheckedChange={checked =>
                handleInputChange('actingOnOwnBehalf', checked)
              }
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
                checked={clientData.actingOnBehalfOfThirdParty}
                onCheckedChange={checked => {
                  handleInputChange('actingOnBehalfOfThirdParty', checked)
                  if (!checked) {
                    setClientData(prev => ({
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
                El client manifesta expressament que està actuant per compte i
                representació d’un tercer. Tercer al que es representa:
              </Label>
            </div>

            <Input
              id="thirdPartyRepresented"
              disabled={!clientData.actingOnBehalfOfThirdParty}
              value={clientData.thirdPartyRepresented}
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
            value={clientData.businessPurpose}
            onChange={e => handleInputChange('businessPurpose', e.target.value)}
            placeholder="Motiu pel que es constitueix societat a Andorra i/o de la relació de negoci amb Ancei Consultoria Estratègica Internacional SA"
            rows={4}
          />

          <InputContainer>
            <Label className="text-sm font-medium">
              És habitual i freqüent la utilització de diners en efectiu a la
              vostra activitat professional / laboral?
            </Label>
            <RadioGroup
              value={clientData.cashUsage}
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
              Desenvolupa la seva activitat professional / laboral en algun dels
              sectors assenyalats a continuació?
            </Label>
            <RadioGroup
              value={clientData.isRiskySector}
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
                !clientData.isRiskySector || clientData.isRiskySector === 'no'
              }
              value={clientData.riskySector}
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
              value={clientData.isPEP}
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
              value={clientData.isSelfExposed}
              onValueChange={value => handleInputChange('isSelfExposed', value)}
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
              value={clientData.isFamilyExposed}
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
              Desenvolupa o ha desenvolupat (**) alguna persona afí al declarant
              alguna funció o càrrec rellevant de caràcter públic, judicial,
              polític, militar o a empreses públiques?
            </Label>
            <RadioGroup
              value={clientData.isAssociatesExposed}
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
            jurídiques conjuntament amb persones que exerceixin o hagin exercit
            una funció o càrrec rellevant de caràcter públic, judicial, polític,
            militar o a empreses públiques.
          </p>

          <Label className="text-sm font-medium">
            Si alguna de les respostes ha estat SI, detallar el càrrec, les
            dates en les quals ho va exercir, el país on va exercir el càrrec i,
            si escau, la vinculació familiar o afí amb el declarant.
          </Label>

          {clientData.relatedPersons.map((person, index) => (
            <RelatedPersonForm
              key={index}
              person={person}
              index={index}
              updatePerson={updatePerson}
              totalPersons={clientData.relatedPersons.length}
              removePerson={removePerson}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setClientData(prev => ({
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
              formulari de coneixement del client (KYC) de persones físiques. El
              client assumeix el compromís d’informar a Ancei Consultoria
              Estratègica Internacional SA de qualsevol modificació que es
              produeixi en relació a si té o no la condició de PEP.
            </p>

            <p className="text-xs text-gray-400">
              (**) No es considerarà que una persona pertany a l’àmbit polític
              quan hagués transcorregut més d´un (1) any des de la data en què
              hagués deixat formalment d’exercir qualsevol de les funcions
              anteriorment expressades.
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
                checked={clientData.authorizedVerification}
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
                dades mitjançant les recerques i/o comprovacions que consideri
                pertinents.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="noTaxProcedure"
                checked={clientData.noTaxProcedure}
                onCheckedChange={checked =>
                  handleInputChange('noTaxProcedure', checked)
                }
              />
              <Label
                htmlFor="noTaxProcedure"
                className="text-sm leading-relaxed"
              >
                Que no estic ni he estat part en cap procediment de comprovació
                o inspecció tributària; en cas, d’estar-ho o haver-ho estat, hem
                comprometo a aportar tota la documentació relativa al mateix.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="legalFundsOrigin"
                checked={clientData.legalFundsOrigin}
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
            <h4 className="font-semibold mb-4">Signatura Digital Requerida</h4>
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
                signerName={clientData.fullName || 'Client'}
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
    </>
  )
}
