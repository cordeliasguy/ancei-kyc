import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  FileText,
  User,
  Building,
  DollarSign,
  Download,
  Eye
} from 'lucide-react'
import { createFileRoute, useParams } from '@tanstack/react-router'

// Mock data
const mockDocument = {
  id: 'KYC-004',
  clientType: 'legal',
  clientName: 'Inversiones Barcelona SA',
  submittedDate: '2024-01-12',
  businessReviewDate: '2024-01-16',
  complianceReviewDate: '2024-01-18',
  status: 'ready_for_government',
  businessReviewer: 'Ana Pérez',
  complianceOfficer: 'Carlos Rodríguez',
  riskLevel: 'low',
  data: {
    companyName: 'Inversiones Barcelona SA',
    legalForm: 'sa',
    registrationNumber: 'A-11223344',
    taxId: 'A11223344',
    registrationDate: '2015-09-10',
    registrationCountry: 'España',
    companyPhone: '+34 934 567 890',
    companyEmail: 'info@inversionesbcn.com',
    website: 'www.inversionesbcn.com',
    registeredAddress: 'Passeig de Gràcia, 100, 5º',
    registeredCity: 'Barcelona',
    registeredPostalCode: '08008',
    registeredCountry: 'España',
    businessActivity: '6420 - Actividades de las sociedades holding',
    businessDescription:
      'Sociedad holding para inversiones inmobiliarias y participaciones empresariales',
    numberOfEmployees: '1-5',
    annualRevenue: '2m_10m',
    businessPurpose:
      'Gestión de inversiones inmobiliarias y participaciones en otras sociedades',
    expectedTransactionVolume: '1m_5m',
    fundsOrigin:
      'Capital social aportado por los socios y beneficios de inversiones anteriores',
    representativeName: 'Elena Martínez Vidal',
    representativePosition: 'Consejera Delegada',
    representativeNationality: 'Española',
    representativeDocumentType: 'dni',
    representativeDocumentNumber: '33445566E',
    representativePhone: '+34 600 234 567',
    representativeEmail: 'elena.martinez@inversionesbcn.com',
    isRegulated: false,
    hasUSConnection: false,
    isPublicCompany: false,
    currentBanks:
      'Banco Sabadell - Cuenta corriente, La Caixa - Cuenta de inversiones',
    accountPurpose:
      'Gestión de inversiones inmobiliarias y transferencias entre participadas',
    additionalInfo:
      'Sociedad con más de 8 años de experiencia en el sector inmobiliario'
  }
}

export const Route = createFileRoute('/_authenticated/company/view/$kycId')({
  component: DocumentView
})

function DocumentView() {
  const { kycId } = useParams({ strict: false }) as { kycId: string }

  console.log('KYC ID', kycId)

  const document = mockDocument
  const isLegalEntity = document.clientType === 'legal'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready_for_government':
        return (
          <Badge variant="default" className="bg-purple-600">
            Ready for Government
          </Badge>
        )
      case 'sent_to_government':
        return (
          <Badge variant="default" className="bg-indigo-600">
            Sent to Government
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-600">
            Approved
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Low Risk
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Medium Risk
          </Badge>
        )
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

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
                  Document View
                </h1>
                <p className="text-gray-600">View completed KYC document</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </Button>
              <Badge variant={isLegalEntity ? 'default' : 'secondary'}>
                {isLegalEntity ? 'Legal Entity' : 'Natural Person'}
              </Badge>
              <Badge variant="secondary">
                <FileText className="w-3 h-3 mr-1" />
                {document.id}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Document Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Document Status */}
            <Card>
              <CardHeader>
                <CardTitle>Document Status & Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Current Status
                      </Label>
                      <div className="mt-1">
                        {getStatusBadge(document.status)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Risk Level
                      </Label>
                      <div className="mt-1">
                        {getRiskBadge(document.riskLevel)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Client Type
                      </Label>
                      <div className="mt-1">
                        <Badge
                          variant={isLegalEntity ? 'default' : 'secondary'}
                        >
                          {isLegalEntity ? 'Legal Entity' : 'Natural Person'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Submitted
                      </Label>
                      <p>{document.submittedDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Business Review
                      </Label>
                      <p>
                        {document.businessReviewDate} by{' '}
                        {document.businessReviewer}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Compliance Review
                      </Label>
                      <p>
                        {document.complianceReviewDate} by{' '}
                        {document.complianceOfficer}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <p className="font-semibold">{document.data.companyName}</p>
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
                      {document.data.representativeDocumentType?.toUpperCase()}:{' '}
                      {document.data.representativeDocumentNumber}
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

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Signatures
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-green-200 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Client Submission
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {document.submittedDate}
                  </p>
                  <p className="text-xs text-gray-600">
                    Signed by {document.data.representativeName}
                  </p>
                </div>

                <div className="border-l-2 border-blue-200 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium">Business Review</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {document.businessReviewDate}
                  </p>
                  <p className="text-xs text-gray-600">
                    Approved by {document.businessReviewer}
                  </p>
                </div>

                <div className="border-l-2 border-orange-200 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Compliance Review
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {document.complianceReviewDate}
                  </p>
                  <p className="text-xs text-gray-600">
                    Validated by {document.complianceOfficer}
                  </p>
                </div>

                <div className="border-l-2 border-purple-200 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Ready for Government
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Awaiting government processing
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <span className="font-medium">Document ID:</span>{' '}
                    {document.id}
                  </div>
                  <div>
                    <span className="font-medium">Client:</span>{' '}
                    {document.clientName}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{' '}
                    {isLegalEntity ? 'Legal Entity' : 'Natural Person'}
                  </div>
                  <div>
                    <span className="font-medium">Risk Level:</span>{' '}
                    {document.riskLevel}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
