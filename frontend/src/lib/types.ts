export type Agency = {
  id: string
  name: string
  createdAt: string
}

export type LegalPersonType = 'management' | 'shareholders' | 'ubos'

export type ManagementMember = {
  id: string
  fullName: string
  position: string
  documentNumber: string
  dateOfBirth: string
  type: string
  countryOfBirth: string
  countryOfResidence: string
}
export type Shareholder = {
  id: string
  fullName: string
  documentNumber: string
  dateOfBirth: string
  professionalActivity: string
  countryOfBirth: string
  countryOfResidence: string
  ownershipPercentage: string
}
export type UBO = {
  id: string
  fullName: string
  nationality: string
  documentNumber: string
  position: string
}

export type RelatedPerson = {
  id: string
  fullName: string
  position: string
  period: string
  country: string
  relationship: string
}

export type NaturalClient = {
  // Personal Information
  fullName: string
  birthDate: string
  birthCountry: string
  nationality: string
  documentType: string
  documentNumber: string
  gender: string
  professionalActivity: string
  profession: string
  maritalStatus: string
  partnerFullName: string
  maritalEconomicRegime: string
  phone: string
  email: string

  // Declarations 1
  fundsNotFromMoneyLaundering: boolean
  fundsSource: boolean
  fundsSourceDetails: string
  actingOnOwnBehalf: boolean
  actingOnBehalfOfThirdParty: boolean
  thirdPartyRepresented: string

  // Addresses
  fiscalAddress: string
  fiscalCity: string
  fiscalPostalCode: string
  fiscalCountry: string
  postalAddress: string
  postalCity: string
  postalPostalCode: string
  postalCountry: string

  // Business Purpose
  businessPurpose: string
  cashUsage: string
  isRiskySector: string
  riskySector: string
  isPEP: string
  isSelfExposed: string
  isFamilyExposed: string
  isAssociatesExposed: string
  relatedPersons: RelatedPerson[]

  // Declarations 2
  authorizedVerification: boolean
  noTaxProcedure: boolean
  legalFundsOrigin: boolean
}
