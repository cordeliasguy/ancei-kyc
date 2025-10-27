import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Plus,
  Check,
  RotateCcw,
  FolderOpen,
  Unlink2
} from 'lucide-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { NaturalClientForm } from '@/components/natural-client-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  linkClientDocument,
  createRelatedPersons,
  getAllKycDocumentsFromAgencyQueryOptions,
  getClientById,
  getClientDocumentsByIdQueryOptions,
  getKycByIdQueryOptions,
  getKycDocumentFilesByIdQueryOptions,
  getKycManagementMembersByIdQueryOptions,
  getKycRelatedPersonsByIdQueryOptions,
  getKycShareholdersByIdQueryOptions,
  getKycUbosByIdQueryOptions,
  updateKycDocument,
  uploadClientDocument,
  getUserQueryOptions,
  unlinkClientDocument,
  createManagementPersons,
  createShareholders,
  createUbos
} from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { SignaturePad } from '@/components/signature-pad'
import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import type {
  Client,
  ClientDocument,
  FormManagementPerson,
  FormRelatedPerson,
  FormShareholder,
  FormUbo,
  KycStatus
} from '@server/sharedTypes'
import { formatFileSize, getFileIcon, openOrDownloadFile } from '@/utils'
import { UploadClientDocumentDialog } from '@/components/upload-client-document-dialog'
import type { KYCFormData } from '@/lib/types'
import { base64ToFile, getFilledNameEntries } from '@/lib/utils'
import { uploadFiles } from '@/utils/uploadthing'
import { toast } from 'sonner'
import { LegalClientForm } from '@/components/legal-client-form'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Spinner } from '@/components/ui/spinner'
import { generateKycPDF } from '@/lib/pdf-generator'

type DocWithState = ClientDocument & { selected: boolean }

export const DocumentView = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: session } = useQuery(getUserQueryOptions)
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
  const [isUnlinkingDocument, setIsUnlinkingDocument] = useState('')
  const [showDocumentUploadDialog, setShowDocumentUploadDialog] =
    useState(false)
  const [userSignature, setUserSignature] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signature, setSignature] = useState<string>()

  const [availableDocuments, setAvailableDocuments] = useState<DocWithState[]>(
    []
  )
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

    const linkedDocumentIds = new Set(
      filteredLinkedDocuments.map(doc => doc.id)
    )

    const filteredAvailableDocuments = clientDocuments.filter(document => {
      if (!document.expiresAt)
        return !document.isSignature && !linkedDocumentIds.has(document.id)

      const expiryDate = new Date(document.expiresAt)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      expiryDate.setHours(0, 0, 0, 0)

      const isExpired = expiryDate < today
      return (
        !document.isSignature &&
        !linkedDocumentIds.has(document.id) &&
        !isExpired
      )
    })

    const documentsWithState = filteredAvailableDocuments.map(doc => ({
      ...doc,
      selected: false
    }))

    setAvailableDocuments(documentsWithState)
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

  const handleOnSubmit = async () => {
    if (!document || !userSignature) return

    setIsSubmitting(true)

    const documentsToLink = availableDocuments.filter(doc => doc.selected)

    const getNextState = (): KycStatus => {
      const nextStateMap = {
        submitted: 'responsible_reviewed',
        responsible_reviewed: 'compliance_reviewed',
        compliance_reviewed: 'completed',
        completed: 'completed'
      } as const

      return nextStateMap[document.status]
    }

    const getSignatureName = () => {
      const signatureNameMap = {
        submitted: 'Signatura responsable',
        responsible_reviewed: 'Signatura compliance',
        compliance_reviewed: 'Signatura ocic',
        completed: 'Error'
      } as const

      return signatureNameMap[document.status]
    }

    const formData = isLegalEntity ? legalFormData : naturalFormData

    const submissionData = {
      ...formData,
      type: document.type,
      clientId: document.clientId,
      agencyId: document.agencyId,
      services: document.services,
      status: getNextState()
    }

    try {
      const signatureFile = base64ToFile(userSignature)

      // Upload Signature to Uploadthing
      const fileInfo = await uploadFiles('blobUploader', {
        files: [signatureFile]
      })

      // Upload Signature to database
      const signature = await uploadClientDocument({
        clientId: document.clientId,
        value: {
          name: getSignatureName(),
          url: fileInfo[0].ufsUrl,
          type: fileInfo[0].type,
          size: fileInfo[0].size,
          isSignature: true,
          expiresAt: new Date(
            new Date().setFullYear(new Date().getFullYear() + 100)
          ).toISOString()
        }
      })

      // Update KYC Document
      const kycDocument = await updateKycDocument({
        value: submissionData,
        kycId: document.id
      })

      // Link Signature
      await linkClientDocument({
        documentId: signature.id,
        kycId: kycDocument.id
      })

      // Link Client Documents included
      if (documentsToLink.length > 0) {
        documentsToLink.forEach(async doc => {
          await linkClientDocument({
            documentId: doc.id,
            kycId: kycDocument.id
          })
        })
      }

      // Update Related Persons
      if (getFilledNameEntries(formRelatedPersons).length > 0) {
        const relatedPersonsWithKycId = formRelatedPersons.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createRelatedPersons({
          value: relatedPersonsWithKycId
        })
      }

      // Update Management Members
      if (getFilledNameEntries(formManagementMembers).length > 0) {
        const managementPersonsWithKycId = formManagementMembers.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createManagementPersons({
          value: managementPersonsWithKycId
        })
      }

      // Update Shareholders
      if (getFilledNameEntries(formShareholders).length > 0) {
        const shareholdersWithKycId = formShareholders.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createShareholders({
          value: shareholdersWithKycId
        })
      }

      // Update UBOs
      if (getFilledNameEntries(formUbos).length > 0) {
        const ubosWithKycId = formUbos.map(p => ({
          ...p,
          kycId: kycDocument.id
        }))

        await createUbos({
          value: ubosWithKycId
        })
      }

      // Refresh related queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getKycDocumentFilesByIdQueryOptions(document.id).queryKey
        }),
        queryClient.invalidateQueries({
          queryKey: getClientDocumentsByIdQueryOptions(document.clientId)
            .queryKey
        }),
        queryClient.invalidateQueries({
          queryKey: getAllKycDocumentsFromAgencyQueryOptions.queryKey
        }),
        queryClient.invalidateQueries({
          queryKey: getKycByIdQueryOptions(kycId).queryKey
        })
      ])

      toast.success('El document KYC s’ha enviat correctament')
      navigate({ to: '/company/dashboard' })
    } catch (error) {
      console.error(error)
      toast.error('L’enviament del document KYC ha fallat')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleDocumentSelection = (docId: string) => {
    setAvailableDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, selected: !doc.selected } : doc
      )
    )
  }

  const handleUnlinkDocument = async (docId: string) => {
    if (!document) return

    setIsUnlinkingDocument(docId)

    await unlinkClientDocument({
      documentId: docId,
      kycId: document.id
    })

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getKycDocumentFilesByIdQueryOptions(document.id).queryKey
      }),
      queryClient.invalidateQueries({
        queryKey: getClientDocumentsByIdQueryOptions(document.clientId).queryKey
      })
    ])

    setIsUnlinkingDocument('')
  }

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

  const getDocumentTitle = () => {
    if (!document) return 'Document KYC'

    const titleMap = {
      submitted: 'Document KYC - Responsable',
      responsible_reviewed: 'Document KYC - Compliance',
      compliance_reviewed: 'Document KYC - Ocic',
      completed: 'Document KYC - Completat'
    } as const

    return titleMap[document.status]
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto p-4 relative">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/company/dashboard' })}
              >
                <ArrowLeft className="size-4 mr-1" />
                Tornar al tauler
              </Button>

              <h1 className="text-2xl font-bold text-gray-900">
                {getDocumentTitle()}
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
                    />
                  ) : (
                    <NaturalClientForm
                      clientData={naturalFormData}
                      setClientData={setNaturalFormData}
                      clientRelatedPersons={formRelatedPersons}
                      setClientRelatedPersons={setFormRelatedPersons}
                    />
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="gap-3">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1.5">
                          <CardTitle className="flex items-center">
                            <FileText className="size-5 mr-2" />
                            Documents del client
                          </CardTitle>
                          <CardDescription>
                            Seleccioneu els documents que voleu incloure
                          </CardDescription>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowDocumentUploadDialog(true)}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {availableDocuments.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 mt-5">
                          <FolderOpen className="size-6" color="gray" />
                          <p className="text-gray-500">
                            No hi ha documents disponibles
                          </p>
                        </div>
                      )}

                      {availableDocuments?.map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={doc.selected}
                              onCheckedChange={() =>
                                handleToggleDocumentSelection(doc.id)
                              }
                            />
                            <div className="flex space-x-1.5">
                              <div className="pt-1">
                                {getFileIcon(doc.type)}
                              </div>

                              <div>
                                <p className="font-medium text-sm">
                                  {doc.name}
                                </p>
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

                  {!userSignature ? (
                    <SignaturePad
                      onSignature={signature => setUserSignature(signature)}
                      signerName={session!.user.name}
                      signerRole={session!.user.role}
                    />
                  ) : (
                    <Card className="gap-3">
                      <CardHeader>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-green-800 font-medium">
                            Document signat correctament
                          </p>
                          <p className="text-sm text-green-600">
                            Signatura capturada el{' '}
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="border rounded-lg p-4 bg-white">
                          <img
                            src={userSignature || '/placeholder.svg'}
                            alt="Signatura del usuari"
                            className="max-h-20"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => setUserSignature(null)}
                            variant="outline"
                            className="flex-1"
                          >
                            <RotateCcw className="size-4 mr-1" />
                            Tornar a Signar
                          </Button>

                          <Button
                            onClick={handleOnSubmit}
                            className="flex-1"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Spinner className="mr-1" />
                                Guardant...
                              </>
                            ) : (
                              <>
                                <Check className="size-4 mr-1" />
                                Guardar
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="gap-3">
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

                          <div className="flex items-center space-x-1.5">
                            {!doc.isSignature && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnlinkDocument(doc.id)}
                                    disabled={isUnlinkingDocument === doc.id}
                                  >
                                    {isUnlinkingDocument === doc.id ? (
                                      <Spinner className="size-3" />
                                    ) : (
                                      <Unlink2 className="size-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Desvincular</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

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
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
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
