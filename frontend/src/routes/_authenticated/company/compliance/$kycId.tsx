import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  FileText,
  User,
  Send,
  Building,
  Users,
  DollarSign,
  Upload,
  File,
  X,
  Download,
  Eye
} from 'lucide-react'
import { SignaturePad } from '@/components/signature-pad'
import { createFileRoute, useParams } from '@tanstack/react-router'

// Mock data with complete form information
const mockDocument = {
  id: 'KYC-003',
  clientCode: 'CLI-002',
  clientType: 'legal', // or "natural"
  clientName: 'Consultoria Tech SL',
  businessReviewDate: '2024-01-14',
  businessReviewer: 'Ana Pérez',
  businessSignature:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  clientSignature:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  status: 'compliance_review',
  riskLevel: 'medium',
  data: {
    // Company Information
    companyName: 'Consultoria Tech SL',
    legalForm: 'sl',
    registrationNumber: 'B-87654321',
    taxId: 'B87654321',
    registrationDate: '2019-03-20',
    registrationCountry: 'España',
    companyPhone: '+34 933 456 789',
    companyEmail: 'info@consultoriatech.com',
    website: 'www.consultoriatech.com',
    registeredAddress: 'Carrer de Balmes, 200, 4º 1ª',
    registeredCity: 'Barcelona',
    registeredPostalCode: '08006',
    registeredCountry: 'España',
    businessActivity:
      '7022 - Actividades de consultoría de gestión empresarial',
    businessDescription:
      'Consultoría estratégica y transformación digital para empresas',
    numberOfEmployees: '11-25',
    annualRevenue: '1m_5m',
    businessPurpose:
      'Apertura de cuenta para gestión de pagos de clientes y proveedores internacionales',
    expectedTransactionVolume: '500k_1m',
    fundsOrigin: 'Ingresos procedentes de servicios de consultoría empresarial',
    representativeName: 'Carlos Martín González',
    representativePosition: 'Administrador Solidario',
    representativeNationality: 'Española',
    representativeDocumentType: 'dni',
    representativeDocumentNumber: '45678912C',
    representativePhone: '+34 600 456 789',
    representativeEmail: 'carlos.martin@consultoriatech.com',
    isRegulated: false,
    hasUSConnection: true,
    usConnectionDetails:
      'Clientes en Estados Unidos - servicios de consultoría remota',
    isPublicCompany: false,
    currentBanks:
      'CaixaBank - Cuenta corriente empresarial, Banco Santander - Cuenta de ahorro',
    accountPurpose:
      'Gestión de cobros internacionales y pagos a proveedores tecnológicos',
    additionalInfo:
      'Empresa con certificación ISO 9001, especializada en transformación digital',
    managementMembers: [
      {
        name: 'Carlos Martín González',
        position: 'Administrador Solidario',
        nationality: 'Española',
        documentType: 'dni',
        documentNumber: '45678912C'
      },
      {
        name: 'Laura Fernández Ruiz',
        position: 'Administradora Solidaria',
        nationality: 'Española',
        documentType: 'dni',
        documentNumber: '78912345D'
      }
    ],
    shareholders: [
      {
        name: 'Carlos Martín González',
        position: 'Socio Fundador',
        nationality: 'Española',
        documentType: 'dni',
        documentNumber: '45678912C',
        ownershipPercentage: '70%'
      },
      {
        name: 'Laura Fernández Ruiz',
        position: 'Socia Cofundadora',
        nationality: 'Española',
        documentType: 'dni',
        documentNumber: '78912345D',
        ownershipPercentage: '30%'
      }
    ],
    ubos: [
      {
        name: 'Carlos Martín González',
        position: 'Beneficiario Último',
        nationality: 'Española',
        documentType: 'dni',
        documentNumber: '45678912C',
        ownershipPercentage: '70%'
      },
      {
        name: 'Laura Fernández Ruiz',
        position: 'Beneficiaria Última',
        nationality: 'Española',
        documentType: 'dni',
        documentNumber: '78912345D',
        ownershipPercentage: '30%'
      }
    ]
  }
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  uploadedBy: string
  category: 'identity' | 'address' | 'financial' | 'legal' | 'other'
  source: 'kyc_submission' | 'client_management'
  selected?: boolean
}

// Mock existing client documents (from client management)
const existingClientDocuments: UploadedDocument[] = [
  {
    id: 'DOC-009',
    name: 'Company_Registration.pdf',
    type: 'PDF',
    size: '3.8 MB',
    uploadDate: '2024-01-13',
    uploadedBy: 'Ana Pérez',
    category: 'legal',
    source: 'kyc_submission',
    selected: true
  },
  {
    id: 'DOC-010',
    name: 'Articles_of_Association.pdf',
    type: 'PDF',
    size: '5.2 MB',
    uploadDate: '2024-01-13',
    uploadedBy: 'Ana Pérez',
    category: 'legal',
    source: 'kyc_submission',
    selected: true
  },
  {
    id: 'DOC-011',
    name: 'Director_ID_Copy.pdf',
    type: 'PDF',
    size: '1.7 MB',
    uploadDate: '2024-01-14',
    uploadedBy: 'Carlos Rodríguez',
    category: 'identity',
    source: 'client_management',
    selected: false
  },
  {
    id: 'DOC-012',
    name: 'Business_Address_Proof.pdf',
    type: 'PDF',
    size: '2.1 MB',
    uploadDate: '2024-01-14',
    uploadedBy: 'Carlos Rodríguez',
    category: 'address',
    source: 'client_management',
    selected: false
  },
  {
    id: 'DOC-013',
    name: 'Financial_Statements_2023.pdf',
    type: 'PDF',
    size: '6.8 MB',
    uploadDate: '2024-01-15',
    uploadedBy: 'Ana Pérez',
    category: 'financial',
    source: 'client_management',
    selected: true
  },
  {
    id: 'DOC-014',
    name: 'Tax_Registration.pdf',
    type: 'PDF',
    size: '1.4 MB',
    uploadDate: '2024-01-15',
    uploadedBy: 'Ana Pérez',
    category: 'legal',
    source: 'client_management',
    selected: false
  },
  {
    id: 'DOC-015',
    name: 'Bank_Account_Details.pdf',
    type: 'PDF',
    size: '0.8 MB',
    uploadDate: '2024-01-16',
    uploadedBy: 'Carlos Rodríguez',
    category: 'financial',
    source: 'client_management',
    selected: true
  },
  {
    id: 'DOC-016',
    name: 'Power_of_Attorney.pdf',
    type: 'PDF',
    size: '2.9 MB',
    uploadDate: '2024-01-16',
    uploadedBy: 'Carlos Rodríguez',
    category: 'legal',
    source: 'client_management',
    selected: false
  }
]

export const Route = createFileRoute(
  '/_authenticated/company/compliance/$kycId'
)({
  component: ComplianceReview
})

function ComplianceReview() {
  const { kycId } = useParams({ strict: false }) as { kycId: string }

  console.log('KYC ID', kycId)

  const document = mockDocument
  const isLegalEntity = document.clientType === 'legal'

  const [complianceNotes, setComplianceNotes] = useState('')
  const [requiredDocuments, setRequiredDocuments] = useState({
    identityDocument: false,
    proofOfAddress: false,
    bankStatements: false,
    sourceOfFunds: false,
    businessPlan: false,
    articlesOfIncorporation: false,
    powerOfAttorney: false
  })
  const [additionalDocuments, setAdditionalDocuments] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [clientDocuments, setClientDocuments] = useState<UploadedDocument[]>(
    existingClientDocuments
  )
  const [newUploadedDocuments, setNewUploadedDocuments] = useState<
    UploadedDocument[]
  >([])

  const handleDocumentCheck = (docType: string, checked: boolean) => {
    setRequiredDocuments(prev => ({
      ...prev,
      [docType]: checked as boolean
    }))
  }

  const allDocumentsChecked = Object.values(requiredDocuments).every(Boolean)

  const handleCompleteCompliance = (signature: string) => {
    setIsProcessing(true)
    setTimeout(() => {
      alert('Document validated and sent to government for final approval!')
      window.location.href = '/company/dashboard'
    }, 2000)
  }

  const handleSendToGovernment = () => {
    if (!allDocumentsChecked) {
      alert('Please verify all required documents are present')
      return
    }
    setShowSignaturePad(true)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc: UploadedDocument = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: 'Carlos Rodríguez',
          category: 'other',
          source: 'client_management',
          selected: true
        }
        setNewUploadedDocuments(prev => [...prev, newDoc])
      })
    }
    // Reset the input
    event.target.value = ''
  }

  const handleRemoveDocument = (docId: string) => {
    setNewUploadedDocuments(prev => prev.filter(doc => doc.id !== docId))
  }

  const handleToggleDocumentSelection = (docId: string) => {
    setClientDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, selected: !doc.selected } : doc
      )
    )
  }

  //   const formatFileSize = (bytes: number) => {
  //     if (bytes === 0) return "0 Bytes"
  //     const k = 1024
  //     const sizes = ["Bytes", "KB", "MB", "GB"]
  //     const i = Math.floor(Math.log(bytes) / Math.log(k))
  //     return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  //   }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'identity':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Identity
          </Badge>
        )
      case 'address':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Address
          </Badge>
        )
      case 'financial':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Financial
          </Badge>
        )
      case 'legal':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Legal
          </Badge>
        )
      case 'other':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            Other
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'kyc_submission':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
            KYC Form
          </Badge>
        )
      case 'client_management':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 text-xs"
          >
            Client Files
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />
      default:
        return <File className="w-4 h-4 text-gray-600" />
    }
  }

  const selectedDocuments = clientDocuments.filter(doc => doc.selected)
  //   const allDocuments = [...clientDocuments, ...newUploadedDocuments]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = '/company/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Compliance Review
                </h1>
                <p className="text-gray-600">
                  Final validation and government preparation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={isLegalEntity ? 'default' : 'secondary'}>
                {isLegalEntity ? 'Legal Entity' : 'Natural Person'}
              </Badge>
              <Badge variant="secondary">
                <FileText className="w-3 h-3 mr-1" />
                {document.id}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Client: {document.clientCode}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Document Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Previous Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Approvals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold">
                      {isLegalEntity
                        ? 'Representative Signature'
                        : 'Client Signature'}
                    </p>
                    <p className="text-sm text-gray-600">Original submission</p>
                    <p className="text-sm text-gray-600">
                      Signed by:{' '}
                      {isLegalEntity
                        ? document.data.representativeName
                        : document.clientName}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Signed
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Business Review</p>
                    <p className="text-sm text-gray-600">
                      Reviewed by: {document.businessReviewer}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {document.businessReviewDate}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-blue-600">
                    Approved & Signed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Complete Client Information */}
            {isLegalEntity ? (
              // Legal Entity Information
              <>
                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Company Name
                        </Label>
                        <p className="font-semibold">
                          {document.data.companyName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Legal Form
                        </Label>
                        <p className="uppercase">{document.data.legalForm}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Registration Number
                        </Label>
                        <p>{document.data.registrationNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Tax ID
                        </Label>
                        <p>{document.data.taxId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Registration Date
                        </Label>
                        <p>{document.data.registrationDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Registration Country
                        </Label>
                        <p>{document.data.registrationCountry}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Phone
                        </Label>
                        <p>{document.data.companyPhone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Email
                        </Label>
                        <p>{document.data.companyEmail}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Website
                        </Label>
                        <p>{document.data.website || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Registered Address
                      </Label>
                      <p>{document.data.registeredAddress}</p>
                      <p>
                        {document.data.registeredCity},{' '}
                        {document.data.registeredPostalCode}
                      </p>
                      <p>{document.data.registeredCountry}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Business Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Business Activity
                        </Label>
                        <p>{document.data.businessActivity}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Number of Employees
                        </Label>
                        <p>{document.data.numberOfEmployees}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Annual Revenue
                        </Label>
                        <p>
                          {document.data.annualRevenue
                            ?.replace('_', ' - ')
                            .replace('under', 'Under')
                            .replace('over', 'Over')}
                          €
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Expected Transaction Volume
                        </Label>
                        <p>
                          {document.data.expectedTransactionVolume
                            ?.replace('_', ' - ')
                            .replace('under', 'Under')
                            .replace('over', 'Over')}
                          €/month
                        </p>
                      </div>
                    </div>

                    {document.data.businessDescription && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Business Description
                        </Label>
                        <p>{document.data.businessDescription}</p>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Business Purpose
                      </Label>
                      <p>{document.data.businessPurpose}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Fund Origin
                      </Label>
                      <p>{document.data.fundsOrigin}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Representative */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Legal Representative
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Name
                        </Label>
                        <p className="font-semibold">
                          {document.data.representativeName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Position
                        </Label>
                        <p>{document.data.representativePosition}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Nationality
                        </Label>
                        <p>{document.data.representativeNationality}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Document
                        </Label>
                        <p>
                          {document.data.representativeDocumentType?.toUpperCase()}
                          : {document.data.representativeDocumentNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Phone
                        </Label>
                        <p>{document.data.representativePhone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Email
                        </Label>
                        <p>{document.data.representativeEmail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Management Structure */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Management Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">
                          Management Members
                        </h4>
                        <div className="space-y-3">
                          {document.data.managementMembers?.map(
                            (member, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-3"
                              >
                                <div className="grid md:grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">
                                      Name
                                    </Label>
                                    <p className="font-medium">{member.name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">
                                      Position
                                    </Label>
                                    <p>{member.position}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">
                                      Document
                                    </Label>
                                    <p>
                                      {member.documentType?.toUpperCase()}:{' '}
                                      {member.documentNumber}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Shareholders</h4>
                        <div className="space-y-3">
                          {document.data.shareholders?.map(
                            (shareholder, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-3"
                              >
                                <div className="grid md:grid-cols-4 gap-3">
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">
                                      Name
                                    </Label>
                                    <p className="font-medium">
                                      {shareholder.name}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">
                                      Position
                                    </Label>
                                    <p>{shareholder.position}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">
                                      Document
                                    </Label>
                                    <p>
                                      {shareholder.documentType?.toUpperCase()}:{' '}
                                      {shareholder.documentNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">
                                      Ownership
                                    </Label>
                                    <p className="font-semibold text-blue-600">
                                      {shareholder.ownershipPercentage}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">
                          Ultimate Beneficial Owners (UBOs)
                        </h4>
                        <div className="space-y-3">
                          {document.data.ubos?.map((ubo, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="grid md:grid-cols-4 gap-3">
                                <div>
                                  <Label className="text-xs font-medium text-gray-600">
                                    Name
                                  </Label>
                                  <p className="font-medium">{ubo.name}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-600">
                                    Position
                                  </Label>
                                  <p>{ubo.position}</p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-600">
                                    Document
                                  </Label>
                                  <p>
                                    {ubo.documentType?.toUpperCase()}:{' '}
                                    {ubo.documentNumber}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-600">
                                    Ownership
                                  </Label>
                                  <p className="font-semibold text-green-600">
                                    {ubo.ownershipPercentage}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Regulated Entity
                        </Label>
                        <Badge
                          variant={
                            document.data.isRegulated ? 'secondary' : 'default'
                          }
                        >
                          {document.data.isRegulated
                            ? 'Regulated'
                            : 'Not Regulated'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          US Connection
                        </Label>
                        <Badge
                          variant={
                            document.data.hasUSConnection
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {document.data.hasUSConnection
                            ? 'Has US Connection'
                            : 'No US Connection'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Public Company
                        </Label>
                        <Badge
                          variant={
                            document.data.isPublicCompany
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {document.data.isPublicCompany ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>

                    {document.data.hasUSConnection &&
                      document.data.usConnectionDetails && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            US Connection Details
                          </Label>
                          <p>{document.data.usConnectionDetails}</p>
                        </div>
                      )}

                    {document.data.currentBanks && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Current Banks
                        </Label>
                        <p>{document.data.currentBanks}</p>
                      </div>
                    )}

                    {document.data.accountPurpose && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Account Purpose
                        </Label>
                        <p>{document.data.accountPurpose}</p>
                      </div>
                    )}

                    {document.data.additionalInfo && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Additional Information
                        </Label>
                        <p>{document.data.additionalInfo}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              // Natural Person Information would go here
              <Card>
                <CardHeader>
                  <CardTitle>Natural Person Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Natural person form data would be displayed here...</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Compliance Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Risk Level
                    </Label>
                    <Badge
                      variant={
                        document.riskLevel === 'low'
                          ? 'default'
                          : document.riskLevel === 'medium'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className={
                        document.riskLevel === 'low'
                          ? 'bg-green-100 text-green-800'
                          : document.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ''
                      }
                    >
                      {document.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Client Type
                    </Label>
                    <Badge variant={isLegalEntity ? 'default' : 'secondary'}>
                      {isLegalEntity ? 'Legal Entity' : 'Natural Person'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Status
                    </Label>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800"
                    >
                      Compliance Review
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Document Management
                </CardTitle>
                <CardDescription>
                  Manage client documents for compliance review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="existing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">
                      Client Documents ({clientDocuments.length})
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      Upload New ({newUploadedDocuments.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="existing" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-600">
                          Select documents to include in review
                        </Label>
                        <Badge variant="outline">
                          {selectedDocuments.length} selected
                        </Badge>
                      </div>

                      {clientDocuments.map(doc => (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            doc.selected
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={doc.selected}
                              onCheckedChange={() =>
                                handleToggleDocumentSelection(doc.id)
                              }
                            />
                            {getFileIcon(doc.type)}
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>{doc.uploadDate}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {getCategoryBadge(doc.category)}
                                {getSourceBadge(doc.source)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label
                        htmlFor="document-upload"
                        className="cursor-pointer"
                      >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Click to upload documents or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG up to 10MB each
                          </p>
                        </div>
                      </Label>
                      <Input
                        id="document-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {newUploadedDocuments.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">
                          Newly Uploaded Documents
                        </Label>
                        {newUploadedDocuments.map(doc => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <div className="flex items-center space-x-3">
                              {getFileIcon(doc.type)}
                              <div>
                                <p className="text-sm font-medium">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.size} • {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Document Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Document Verification</CardTitle>
                <CardDescription>
                  Verify all required documents are present and valid
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="identityDocument"
                      checked={requiredDocuments.identityDocument}
                      onCheckedChange={checked =>
                        handleDocumentCheck(
                          'identityDocument',
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="identityDocument" className="text-sm">
                      Identity Document (DNI/NIE/Passport)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="proofOfAddress"
                      checked={requiredDocuments.proofOfAddress}
                      onCheckedChange={checked =>
                        handleDocumentCheck(
                          'proofOfAddress',
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="proofOfAddress" className="text-sm">
                      Proof of Address
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bankStatements"
                      checked={requiredDocuments.bankStatements}
                      onCheckedChange={checked =>
                        handleDocumentCheck(
                          'bankStatements',
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="bankStatements" className="text-sm">
                      Bank Statements (3 months)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sourceOfFunds"
                      checked={requiredDocuments.sourceOfFunds}
                      onCheckedChange={checked =>
                        handleDocumentCheck('sourceOfFunds', checked as boolean)
                      }
                    />
                    <Label htmlFor="sourceOfFunds" className="text-sm">
                      Source of Funds Documentation
                    </Label>
                  </div>
                  {isLegalEntity && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="articlesOfIncorporation"
                          checked={requiredDocuments.articlesOfIncorporation}
                          onCheckedChange={checked =>
                            handleDocumentCheck(
                              'articlesOfIncorporation',
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor="articlesOfIncorporation"
                          className="text-sm"
                        >
                          Articles of Incorporation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="businessPlan"
                          checked={requiredDocuments.businessPlan}
                          onCheckedChange={checked =>
                            handleDocumentCheck(
                              'businessPlan',
                              checked as boolean
                            )
                          }
                        />
                        <Label htmlFor="businessPlan" className="text-sm">
                          Business Plan/Activity Description
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="powerOfAttorney"
                          checked={requiredDocuments.powerOfAttorney}
                          onCheckedChange={checked =>
                            handleDocumentCheck(
                              'powerOfAttorney',
                              checked as boolean
                            )
                          }
                        />
                        <Label htmlFor="powerOfAttorney" className="text-sm">
                          Power of Attorney (if applicable)
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Requirements</CardTitle>
                <CardDescription>
                  List any additional documents or information needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="List any additional documents or clarifications needed..."
                  value={additionalDocuments}
                  onChange={e => setAdditionalDocuments(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Compliance Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Notes</CardTitle>
                <CardDescription>
                  Add compliance review observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter compliance review notes..."
                  value={complianceNotes}
                  onChange={e => setComplianceNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {!showSignaturePad ? (
              <Card>
                <CardHeader>
                  <CardTitle>Send to Government</CardTitle>
                  <CardDescription>
                    Complete compliance review and send for government approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p>
                        Selected documents:{' '}
                        {selectedDocuments.length + newUploadedDocuments.length}
                      </p>
                      <p>
                        Required verifications:{' '}
                        {
                          Object.values(requiredDocuments).filter(Boolean)
                            .length
                        }
                        /{Object.keys(requiredDocuments).length}
                      </p>
                    </div>
                    <Button
                      onClick={handleSendToGovernment}
                      disabled={!allDocumentsChecked || isProcessing}
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Government
                    </Button>
                    {!allDocumentsChecked && (
                      <p className="text-sm text-red-600 mt-2">
                        Please verify all required documents before proceeding
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Officer Signature</CardTitle>
                  <CardDescription>
                    Sign to complete compliance review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SignaturePad
                    onSignature={handleCompleteCompliance}
                    signerName="Carlos Rodríguez"
                    signerRole="Compliance Officer"
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Compliance Officer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold">Carlos Rodríguez</p>
                  <p>Senior Compliance Officer</p>
                  <p>Ancei Consultoria Estratègica Internacional SA</p>
                  <p className="mt-2">License: COMP-2024-001</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
