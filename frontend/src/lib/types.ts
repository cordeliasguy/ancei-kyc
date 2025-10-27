import type {
  CreateKycDocument,
  EntityType,
  KycServiceType
} from '@server/sharedTypes'

export type LegalPerson = 'management' | 'shareholders' | 'ubos' | 'related'

export type KYCSession = {
  clientId: string
  clientName: string
  clientEmail: string
  clientType: EntityType
  clientPhone: string
  services: { service: KycServiceType; frequency: 'One-time' | 'Recurring' }[]
  agencyId: string
}

export type KYCFormData = Omit<
  CreateKycDocument,
  'type' | 'clientId' | 'agencyId' | 'services'
>
