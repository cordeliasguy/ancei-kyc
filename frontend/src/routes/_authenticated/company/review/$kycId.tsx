import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { NaturalClientForm } from '@/components/natural-client-form'
import { nanoid } from 'nanoid'

// Mock data
const mockDocument = {
  id: 'KYC-004',
  clientType: 'natural',
  clientName: 'Inversiones Barcelona SA',
  submittedDate: '2024-01-12',
  businessReviewDate: '',
  complianceReviewDate: '',
  status: 'waiting_business_review',
  data: {
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
  }
}

export const Route = createFileRoute('/_authenticated/company/review/$kycId')({
  component: DocumentView
})

function DocumentView() {
  const { kycId } = useParams({ strict: false }) as { kycId: string }

  console.log('KYC ID', kycId)

  const document = mockDocument
  const isLegalEntity = document.clientType === 'legal'

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
            <NaturalClientForm clientData={mockDocument.data} />
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

                <div className="border-l-2 border-slate-200 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Ready for Business Review
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Awaiting business review
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
