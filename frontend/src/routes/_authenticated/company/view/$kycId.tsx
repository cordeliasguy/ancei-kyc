import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react'
import { createFileRoute, useParams, useRouter } from '@tanstack/react-router'
import { NaturalClientForm } from '@/components/natural-client-form'
import { useQuery } from '@tanstack/react-query'
import {
  getClientById,
  getClientDocumentsByIdQueryOptions,
  getKycByIdQueryOptions,
  getKycDocumentFilesByIdQueryOptions,
  getKycManagementMembersByIdQueryOptions,
  getKycRelatedPersonsByIdQueryOptions,
  getKycShareholdersByIdQueryOptions,
  getKycUbosByIdQueryOptions
} from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import type {
  Client,
  ClientDocument,
  FormManagementPerson,
  FormRelatedPerson,
  FormShareholder,
  FormUbo
} from '@server/sharedTypes'
import { formatFileSize, getFileIcon, openOrDownloadFile } from '@/utils'
import { UploadClientDocumentDialog } from '@/components/upload-client-document-dialog'
import type { KYCFormData } from '@/lib/types'
import { LegalClientForm } from '@/components/legal-client-form'
import { Spinner } from '@/components/ui/spinner'
import { generateKycPDF } from '@/lib/pdf-generator'

export const Route = createFileRoute('/_authenticated/company/view/$kycId')({
  component: DocumentView
})

function DocumentView() {
  const router = useRouter()

  const { kycId } = useParams({ strict: false }) as { kycId: string }

  const { data: relatedPersons } = useQuery({
    ...getKycRelatedPersonsByIdQueryOptions({ kycId }),
    enabled: !!kycId
  })

  const { data: managementMembers } = useQuery({
    ...getKycManagementMembersByIdQueryOptions({ kycId }),
    enabled: !!kycId
  })

  const { data: shareholders } = useQuery({
    ...getKycShareholdersByIdQueryOptions({ kycId }),
    enabled: !!kycId
  })

  const { data: ubos } = useQuery({
    ...getKycUbosByIdQueryOptions({ kycId }),
    enabled: !!kycId
  })

  const [naturalFormData, setNaturalFormData] = useState<KYCFormData>({
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
  const [legalFormData, setLegalFormData] = useState<KYCFormData>({
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

  const [formRelatedPersons, setFormRelatedPersons] = useState<
    FormRelatedPerson[]
  >([])
  const [formManagementMembers, setFormManagementMembers] = useState<
    FormManagementPerson[]
  >([])
  const [formShareholders, setFormShareholders] = useState<FormShareholder[]>(
    []
  )
  const [formUbos, setFormUbos] = useState<FormUbo[]>([])

  const [isLoadingDocument, setIsLoadingDocument] = useState('')
  const [showDocumentUploadDialog, setShowDocumentUploadDialog] =
    useState(false)
  const [signature, setSignature] = useState<string>()

  const [linkedDocuments, setLinkedDocuments] = useState<ClientDocument[]>([])

  const [client, setClient] = useState<Client | null>(null)

  const {
    data: document,
    error,
    isPending
  } = useQuery(getKycByIdQueryOptions(kycId))

  const { data: kycFiles } = useQuery(
    getKycDocumentFilesByIdQueryOptions(kycId)
  )

  const { data: clientDocuments } = useQuery({
    ...getClientDocumentsByIdQueryOptions(document?.clientId ?? ''),
    enabled: document ? true : false
  })

  useEffect(() => {
    if (!kycFiles || !clientDocuments || !document) return

    const filteredLinkedDocuments = clientDocuments.filter(document =>
      kycFiles.find(file => file.documentId === document.id)
    )

    setLinkedDocuments(filteredLinkedDocuments)
    setSignature(
      filteredLinkedDocuments.find(
        doc => doc.isSignature && doc.name === 'Signatura client'
      )?.url
    )
  }, [kycFiles, clientDocuments, document])

  useEffect(() => {
    if (!document) return

    if (document.type === 'legal') {
      setLegalFormData(document)
    } else {
      setNaturalFormData(document)
    }

    const getClient = async () => {
      const res = await getClientById({ id: document.clientId })
      setClient(res)
    }

    getClient()
  }, [document])

  useEffect(() => {
    if (!relatedPersons || relatedPersons.length === 0) return

    setFormRelatedPersons(relatedPersons)
  }, [relatedPersons])

  useEffect(() => {
    if (!managementMembers || managementMembers.length === 0) return

    setFormManagementMembers(managementMembers)
  }, [managementMembers])

  useEffect(() => {
    if (!shareholders || shareholders.length === 0) return

    setFormShareholders(shareholders)
  }, [shareholders])

  useEffect(() => {
    if (!ubos || ubos.length === 0) return

    setFormUbos(ubos)
  }, [ubos])

  const handleDownloadPDF = async () => {
    if (!signature) return

    generateKycPDF({
      formData: isLegalEntity ? legalFormData : naturalFormData,
      relatedPersons: formRelatedPersons,
      managementMembers: formManagementMembers,
      shareholders: formShareholders,
      ubos: formUbos,
      signatureDataUrl: signature,
      formType: isLegalEntity ? 'legal' : 'natural'
    })
  }

  if (error) return <div>Error: {error.message}</div>

  const isLegalEntity = document?.type === 'legal'

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto p-4 relative">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => router.history.back()}>
                <ArrowLeft className="size-4 mr-1" />
                Tornar
              </Button>

              <h1 className="text-2xl font-bold text-gray-900">
                Visualització del document
              </h1>

              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="rounded-full">
                  {isLegalEntity ? 'P. Jurídica' : 'P. Física'}
                </Badge>
                <Button
                  variant="outline"
                  className="w-fit bg-transparent"
                  onClick={handleDownloadPDF}
                >
                  <Download className="size-4 mr-2" />
                  Descarrega PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {isPending ? (
              <>
                <div className="lg:col-span-3">
                  <Skeleton className="w-full h-96 mb-6 rounded-xl" />
                  <Skeleton className="w-full h-96 mb-6 rounded-xl" />
                  <Skeleton className="w-full h-96 mb-6 rounded-xl" />
                </div>

                <div className="space-y-6 lg:sticky lg:top-6 self-start h-fit">
                  <Skeleton className="w-full h-56 mb-6 rounded-xl" />
                  <Skeleton className="w-full h-80 mb-6 rounded-xl" />
                </div>
              </>
            ) : (
              <>
                {/* Document Content */}
                <div className="lg:col-span-3 space-y-6">
                  {isLegalEntity ? (
                    <LegalClientForm
                      existingData={legalFormData}
                      setExistingData={setLegalFormData}
                      existingRelatedPersons={formRelatedPersons}
                      setExistingRelatedPersons={setFormRelatedPersons}
                      existingManagementMembers={formManagementMembers}
                      setExistingManagementMembers={setFormManagementMembers}
                      existingShareholders={formShareholders}
                      setExistingShareholders={setFormShareholders}
                      existingUbos={formUbos}
                      setExistingUbos={setFormUbos}
                      isViewing
                    />
                  ) : (
                    <NaturalClientForm
                      clientData={naturalFormData}
                      setClientData={setNaturalFormData}
                      clientRelatedPersons={formRelatedPersons}
                      setClientRelatedPersons={setFormRelatedPersons}
                      isViewing
                    />
                  )}
                </div>

                {/* Sidebar */}
                <Card className="gap-3 h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="size-5 mr-2" />
                      Documents vinculats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {linkedDocuments?.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex space-x-1.5">
                          <div className="pt-1">{getFileIcon(doc.type)}</div>

                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>•</span>
                              <span>
                                {
                                  new Date(doc.uploadedAt)
                                    .toISOString()
                                    .split('T')[0]
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setIsLoadingDocument(doc.id)
                            await openOrDownloadFile(doc.url, doc.name)
                            setIsLoadingDocument('')
                          }}
                          disabled={isLoadingDocument === doc.id}
                        >
                          {isLoadingDocument === doc.id ? (
                            <Spinner className="size-3" />
                          ) : (
                            <Eye className="size-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {client && (
        <UploadClientDocumentDialog
          uploadingClient={client}
          showDocumentUploadDialog={showDocumentUploadDialog}
          setShowDocumentUploadDialog={setShowDocumentUploadDialog}
        />
      )}
    </>
  )
}
