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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Users,
  Building,
  Search,
  Filter,
  Send,
  Shield,
  User,
  LogOut
} from 'lucide-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

interface Document {
  id: string
  clientName: string
  clientCode: string
  clientType: 'natural' | 'legal'
  submittedDate: string
  serviceType: string
  status:
    | 'pending_review'
    | 'business_review'
    | 'compliance_review'
    | 'sent_to_government'
    | 'approved'
    | 'rejected'
  assignedTo?: string
  riskLevel: 'low' | 'medium' | 'high'
  businessReviewer?: string
  complianceOfficer?: string
  lastUpdated: string
}

export const Route = createFileRoute('/_authenticated/company/dashboard/')({
  component: CompanyDashboard
})

function CompanyDashboard() {
  const navigate = useNavigate()

  const [isSigningOut, setIsSigningOut] = useState(false)

  const [documents] = useState<Document[]>([
    {
      id: 'KYC-001',
      clientName: 'Maria García López',
      clientCode: 'CLI-001',
      clientType: 'natural',
      submittedDate: '2024-01-15',
      serviceType: 'Tax Advisory',
      status: 'pending_review',
      riskLevel: 'low',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'KYC-002',
      clientName: 'Joan Martínez Vila',
      clientCode: 'CLI-003',
      clientType: 'natural',
      submittedDate: '2024-01-14',
      serviceType: 'Legal Consultation',
      status: 'business_review',
      assignedTo: 'Ana Pérez',
      businessReviewer: 'Ana Pérez',
      riskLevel: 'low',
      lastUpdated: '2024-01-16'
    },
    {
      id: 'KYC-003',
      clientName: 'Consultoria Tech SL',
      clientCode: 'CLI-002',
      clientType: 'legal',
      submittedDate: '2024-01-13',
      serviceType: 'Business Setup',
      status: 'compliance_review',
      assignedTo: 'Carlos Rodríguez',
      businessReviewer: 'Ana Pérez',
      complianceOfficer: 'Carlos Rodríguez',
      riskLevel: 'medium',
      lastUpdated: '2024-01-17'
    },
    {
      id: 'KYC-004',
      clientName: 'Inversiones Barcelona SA',
      clientCode: 'CLI-004',
      clientType: 'legal',
      submittedDate: '2024-01-12',
      serviceType: 'Investment Advisory',
      status: 'sent_to_government',
      businessReviewer: 'Ana Pérez',
      complianceOfficer: 'Carlos Rodríguez',
      riskLevel: 'low',
      lastUpdated: '2024-01-18'
    },
    {
      id: 'KYC-005',
      clientName: 'Pedro López García',
      clientCode: 'CLI-005',
      clientType: 'natural',
      submittedDate: '2024-01-11',
      serviceType: 'HR Services',
      status: 'sent_to_government',
      businessReviewer: 'Ana Pérez',
      complianceOfficer: 'Carlos Rodríguez',
      riskLevel: 'low',
      lastUpdated: '2024-01-19'
    },
    {
      id: 'KYC-006',
      clientName: 'Laura Sánchez Ruiz',
      clientCode: 'CLI-006',
      clientType: 'natural',
      submittedDate: '2024-01-10',
      serviceType: 'Accounting',
      status: 'approved',
      businessReviewer: 'Ana Pérez',
      complianceOfficer: 'Carlos Rodríguez',
      riskLevel: 'low',
      lastUpdated: '2024-01-20'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterService, setFilterService] = useState<string>('all')

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.clientType === filterType
    const matchesRisk = filterRisk === 'all' || doc.riskLevel === filterRisk
    const matchesService =
      filterService === 'all' || doc.serviceType === filterService
    return matchesSearch && matchesType && matchesRisk && matchesService
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'business_review':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Users className="w-3 h-3 mr-1" />
            Business Review
          </Badge>
        )
      case 'compliance_review':
        return (
          <Badge variant="default" className="bg-orange-600">
            <Shield className="w-3 h-3 mr-1" />
            Compliance Review
          </Badge>
        )
      case 'sent_to_government':
        return (
          <Badge variant="default" className="bg-indigo-600">
            <Send className="w-3 h-3 mr-1" />
            Sent to Government
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
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

  const getDocumentsByStatus = (status: string) => {
    return filteredDocuments.filter(doc => doc.status === status)
  }

  const handleReviewDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (doc?.status === 'pending_review' || doc?.status === 'business_review') {
      window.location.href = `/company/review/${docId}`
    } else if (doc?.status === 'compliance_review') {
      window.location.href = `/company/compliance/${docId}`
    } else {
      window.location.href = `/company/view/${docId}`
    }
  }

  const kanbanColumns = [
    {
      id: 'pending_review',
      title: 'Pending Review',
      color: 'bg-gray-100',
      count: getDocumentsByStatus('pending_review').length
    },
    {
      id: 'business_review',
      title: 'Business Review',
      color: 'bg-blue-50',
      count: getDocumentsByStatus('business_review').length
    },
    {
      id: 'compliance_review',
      title: 'Compliance Review',
      color: 'bg-orange-50',
      count: getDocumentsByStatus('compliance_review').length
    },
    {
      id: 'sent_to_government',
      title: 'Sent to Gov',
      color: 'bg-indigo-50',
      count: getDocumentsByStatus('sent_to_government').length
    },
    {
      id: 'approved',
      title: 'Approved',
      color: 'bg-green-50',
      count: getDocumentsByStatus('approved').length
    }
  ]

  const serviceTypes = [...new Set(documents.map(doc => doc.serviceType))]

  // const handleCompleteAdmin = async () => {
  //   await api.users
  //     .$put({
  //       json: {
  //         role: 'admin',
  //         agencyId: '0cdc23ef-0673-493d-88f3-ca974ceb127c'
  //       }
  //     })
  //     .then(res => console.log(res))
  // }

  const handleOnSignOut = async () => {
    setIsSigningOut(true)

    await authClient
      .signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/' })
          }
        }
      })
      .finally(() => setIsSigningOut(false))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Company Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage KYC document reviews and compliance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleOnSignOut}
                variant="outline"
                disabled={isSigningOut}
              >
                <LogOut className="w-4 h-4 mr-1" />
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>

              <Button variant="outline" asChild>
                <Link to="/company/clients">
                  <Users className="w-4 h-4 mr-1" />
                  Manage Clients
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {/* <div className="grid lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {documents.filter(d => d.status === 'pending_review').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Business Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {documents.filter(d => d.status === 'business_review').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {documents.filter(d => d.status === 'compliance_review').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by client name, document ID, or client code..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="natural">Natural Person</SelectItem>
                  <SelectItem value="legal">Legal Entity</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="kanban" className="space-y-6">
          <TabsList>
            <TabsTrigger className="cursor-pointer" value="kanban">
              Kanban Board
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="list">
              List View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {kanbanColumns.map(column => (
                <Card key={column.id} className={`${column.color} min-h-96`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>{column.title}</span>
                      <Badge variant="secondary" className="ml-2">
                        {column.count}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {getDocumentsByStatus(column.id).map(doc => (
                      <Card
                        key={doc.id}
                        className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer py-2"
                      >
                        <CardContent
                          className="p-3"
                          onClick={() => handleReviewDocument(doc.id)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">
                                {doc.id}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  doc.clientType === 'natural'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-green-50 text-green-700'
                                }
                              >
                                {doc.clientType === 'natural'
                                  ? 'Natural'
                                  : 'Legal'}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-sm">
                              {doc.clientName}
                            </h4>
                            <div className="text-xs text-gray-600">
                              <div>Client: {doc.clientCode}</div>
                              <div>Service: {doc.serviceType}</div>
                              {doc.assignedTo && (
                                <div>Assigned: {doc.assignedTo}</div>
                              )}
                            </div>

                            <div className="flex justify-end">
                              <span className="text-xs text-gray-500">
                                {doc.lastUpdated}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All KYC Documents</CardTitle>
                <CardDescription>
                  Complete list of submitted KYC documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDocuments.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {doc.clientType === 'natural' ? (
                            <User className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Building className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{doc.clientName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {doc.clientCode}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                doc.clientType === 'natural'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-green-50 text-green-700'
                              }
                            >
                              {doc.clientType === 'natural'
                                ? 'Natural Person'
                                : 'Legal Entity'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Document ID: {doc.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            Service: {doc.serviceType}
                          </p>
                          <p className="text-sm text-gray-600">
                            Submitted: {doc.submittedDate}
                          </p>
                          <p className="text-sm text-gray-600">
                            Last Updated: {doc.lastUpdated}
                          </p>
                          {doc.assignedTo && (
                            <p className="text-sm text-gray-600">
                              Assigned to: {doc.assignedTo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getRiskBadge(doc.riskLevel)}
                        {getStatusBadge(doc.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewDocument(doc.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {doc.status === 'pending_review' ||
                          doc.status === 'business_review'
                            ? 'Review'
                            : doc.status === 'compliance_review'
                              ? 'Compliance'
                              : 'View'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
