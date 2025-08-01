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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  File,
  ImageIcon,
  Trash2
} from 'lucide-react'
import { createFileRoute, Link } from '@tanstack/react-router'

interface Client {
  id: string
  code: string
  name: string
  email: string
  phone: string
  type: 'natural' | 'legal'
  registrationDate: string
  status: 'active' | 'inactive' | 'pending'
  kycCount: number
  lastKycDate?: string
  serviceTypes: string[]
  documentsCount: number
}

interface KycDocument {
  id: string
  clientCode: string
  submittedDate: string
  serviceType: string
  status:
    | 'pending_review'
    | 'business_review'
    | 'compliance_review'
    | 'sent_to_government'
    | 'approved'
    | 'rejected'
  reviewer?: string
  uploadedDocuments: UploadedDocument[]
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  uploadedBy: string
  category: 'identity' | 'address' | 'financial' | 'legal' | 'other'
  source: 'kyc_submission' | 'client_management' // New field to track source
}

export const Route = createFileRoute('/_authenticated/company/clients/')({
  component: ClientsPage
})

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      code: 'CLI-001',
      name: 'Maria García López',
      email: 'maria.garcia@email.com',
      phone: '+34 600 123 456',
      type: 'natural',
      registrationDate: '2024-01-10',
      status: 'active',
      kycCount: 2,
      lastKycDate: '2024-01-15',
      serviceTypes: ['Tax Advisory', 'Legal Consultation'],
      documentsCount: 5
    },
    {
      id: '2',
      code: 'CLI-002',
      name: 'Consultoria Tech SL',
      email: 'info@consultoriatech.com',
      phone: '+34 933 456 789',
      type: 'legal',
      registrationDate: '2024-01-08',
      status: 'active',
      kycCount: 1,
      lastKycDate: '2024-01-13',
      serviceTypes: ['Business Setup'],
      documentsCount: 8
    },
    {
      id: '3',
      code: 'CLI-003',
      name: 'Joan Martínez Vila',
      email: 'joan.martinez@email.com',
      phone: '+34 600 987 654',
      type: 'natural',
      registrationDate: '2024-01-12',
      status: 'active',
      kycCount: 1,
      lastKycDate: '2024-01-14',
      serviceTypes: ['Legal Consultation'],
      documentsCount: 3
    },
    {
      id: '4',
      code: 'CLI-004',
      name: 'Inversiones Barcelona SA',
      email: 'contact@inversionesbcn.com',
      phone: '+34 932 555 777',
      type: 'legal',
      registrationDate: '2024-01-05',
      status: 'active',
      kycCount: 1,
      lastKycDate: '2024-01-12',
      serviceTypes: ['Investment Advisory'],
      documentsCount: 6
    },
    {
      id: '5',
      code: 'CLI-005',
      name: 'Pedro López García',
      email: 'pedro.lopez@email.com',
      phone: '+34 600 555 123',
      type: 'natural',
      registrationDate: '2024-01-09',
      status: 'active',
      kycCount: 1,
      lastKycDate: '2024-01-11',
      serviceTypes: ['HR Services'],
      documentsCount: 4
    },
    {
      id: '6',
      code: 'CLI-006',
      name: 'Laura Sánchez Ruiz',
      email: 'laura.sanchez@email.com',
      phone: '+34 600 777 999',
      type: 'natural',
      registrationDate: '2024-01-07',
      status: 'active',
      kycCount: 1,
      lastKycDate: '2024-01-10',
      serviceTypes: ['Accounting'],
      documentsCount: 4 // Updated to include client management documents
    }
  ])

  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>([
    {
      id: 'KYC-001',
      clientCode: 'CLI-001',
      submittedDate: '2024-01-15',
      serviceType: 'Tax Advisory',
      status: 'pending_review',
      uploadedDocuments: [
        {
          id: 'DOC-001',
          name: 'DNI_Maria_Garcia.pdf',
          type: 'PDF',
          size: '2.1 MB',
          uploadDate: '2024-01-15',
          uploadedBy: 'Ana Pérez',
          category: 'identity',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-002',
          name: 'Utility_Bill_January.pdf',
          type: 'PDF',
          size: '1.8 MB',
          uploadDate: '2024-01-15',
          uploadedBy: 'Ana Pérez',
          category: 'address',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-003',
          name: 'Bank_Statement_Dec2023.pdf',
          type: 'PDF',
          size: '3.2 MB',
          uploadDate: '2024-01-16',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        },
        {
          id: 'DOC-004',
          name: 'Tax_Declaration_2023.pdf',
          type: 'PDF',
          size: '4.5 MB',
          uploadDate: '2024-01-16',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        },
        {
          id: 'DOC-005',
          name: 'Employment_Contract.pdf',
          type: 'PDF',
          size: '1.2 MB',
          uploadDate: '2024-01-17',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'client_management'
        }
      ]
    },
    {
      id: 'KYC-002',
      clientCode: 'CLI-003',
      submittedDate: '2024-01-14',
      serviceType: 'Legal Consultation',
      status: 'business_review',
      uploadedDocuments: [
        {
          id: 'DOC-006',
          name: 'Passport_Joan_Martinez.pdf',
          type: 'PDF',
          size: '1.9 MB',
          uploadDate: '2024-01-14',
          uploadedBy: 'Ana Pérez',
          category: 'identity',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-007',
          name: 'Rental_Agreement.pdf',
          type: 'PDF',
          size: '2.3 MB',
          uploadDate: '2024-01-14',
          uploadedBy: 'Ana Pérez',
          category: 'address',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-008',
          name: 'Income_Certificate.pdf',
          type: 'PDF',
          size: '1.1 MB',
          uploadDate: '2024-01-15',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        }
      ]
    },
    {
      id: 'KYC-003',
      clientCode: 'CLI-002',
      submittedDate: '2024-01-13',
      serviceType: 'Business Setup',
      status: 'compliance_review',
      uploadedDocuments: [
        {
          id: 'DOC-009',
          name: 'Company_Registration.pdf',
          type: 'PDF',
          size: '3.8 MB',
          uploadDate: '2024-01-13',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-010',
          name: 'Articles_of_Association.pdf',
          type: 'PDF',
          size: '5.2 MB',
          uploadDate: '2024-01-13',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-011',
          name: 'Director_ID_Copy.pdf',
          type: 'PDF',
          size: '1.7 MB',
          uploadDate: '2024-01-14',
          uploadedBy: 'Carlos Rodríguez',
          category: 'identity',
          source: 'client_management'
        },
        {
          id: 'DOC-012',
          name: 'Business_Address_Proof.pdf',
          type: 'PDF',
          size: '2.1 MB',
          uploadDate: '2024-01-14',
          uploadedBy: 'Carlos Rodríguez',
          category: 'address',
          source: 'client_management'
        },
        {
          id: 'DOC-013',
          name: 'Financial_Statements_2023.pdf',
          type: 'PDF',
          size: '6.8 MB',
          uploadDate: '2024-01-15',
          uploadedBy: 'Ana Pérez',
          category: 'financial',
          source: 'client_management'
        },
        {
          id: 'DOC-014',
          name: 'Tax_Registration.pdf',
          type: 'PDF',
          size: '1.4 MB',
          uploadDate: '2024-01-15',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'client_management'
        },
        {
          id: 'DOC-015',
          name: 'Bank_Account_Details.pdf',
          type: 'PDF',
          size: '0.8 MB',
          uploadDate: '2024-01-16',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        },
        {
          id: 'DOC-016',
          name: 'Power_of_Attorney.pdf',
          type: 'PDF',
          size: '2.9 MB',
          uploadDate: '2024-01-16',
          uploadedBy: 'Carlos Rodríguez',
          category: 'legal',
          source: 'client_management'
        }
      ]
    },
    {
      id: 'KYC-004',
      clientCode: 'CLI-004',
      submittedDate: '2024-01-12',
      serviceType: 'Investment Advisory',
      status: 'sent_to_government',
      uploadedDocuments: [
        {
          id: 'DOC-017',
          name: 'Corporate_Registry.pdf',
          type: 'PDF',
          size: '4.1 MB',
          uploadDate: '2024-01-12',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-018',
          name: 'Shareholder_List.pdf',
          type: 'PDF',
          size: '1.9 MB',
          uploadDate: '2024-01-12',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-019',
          name: 'Investment_Portfolio.pdf',
          type: 'PDF',
          size: '7.3 MB',
          uploadDate: '2024-01-13',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        },
        {
          id: 'DOC-020',
          name: 'Risk_Assessment.pdf',
          type: 'PDF',
          size: '2.7 MB',
          uploadDate: '2024-01-13',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        },
        {
          id: 'DOC-021',
          name: 'Compliance_Certificate.pdf',
          type: 'PDF',
          size: '1.3 MB',
          uploadDate: '2024-01-14',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'client_management'
        },
        {
          id: 'DOC-022',
          name: 'Board_Resolution.pdf',
          type: 'PDF',
          size: '2.2 MB',
          uploadDate: '2024-01-14',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'client_management'
        }
      ]
    },
    {
      id: 'KYC-005',
      clientCode: 'CLI-005',
      submittedDate: '2024-01-11',
      serviceType: 'HR Services',
      status: 'sent_to_government',
      uploadedDocuments: [
        {
          id: 'DOC-023',
          name: 'Employee_ID.pdf',
          type: 'PDF',
          size: '1.6 MB',
          uploadDate: '2024-01-11',
          uploadedBy: 'Ana Pérez',
          category: 'identity',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-024',
          name: 'Address_Verification.pdf',
          type: 'PDF',
          size: '1.4 MB',
          uploadDate: '2024-01-11',
          uploadedBy: 'Ana Pérez',
          category: 'address',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-025',
          name: 'Salary_Certificate.pdf',
          type: 'PDF',
          size: '0.9 MB',
          uploadDate: '2024-01-12',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        },
        {
          id: 'DOC-026',
          name: 'HR_Policy_Agreement.pdf',
          type: 'PDF',
          size: '3.1 MB',
          uploadDate: '2024-01-12',
          uploadedBy: 'Carlos Rodríguez',
          category: 'legal',
          source: 'client_management'
        }
      ]
    },
    {
      id: 'KYC-006',
      clientCode: 'CLI-006',
      submittedDate: '2024-01-10',
      serviceType: 'Accounting',
      status: 'approved',
      uploadedDocuments: [
        {
          id: 'DOC-027',
          name: 'National_ID.pdf',
          type: 'PDF',
          size: '1.8 MB',
          uploadDate: '2024-01-10',
          uploadedBy: 'Ana Pérez',
          category: 'identity',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-028',
          name: 'Business_License.pdf',
          type: 'PDF',
          size: '2.4 MB',
          uploadDate: '2024-01-10',
          uploadedBy: 'Ana Pérez',
          category: 'legal',
          source: 'kyc_submission'
        },
        {
          id: 'DOC-029',
          name: 'Updated_Address_Proof.pdf',
          type: 'PDF',
          size: '1.9 MB',
          uploadDate: '2024-01-18',
          uploadedBy: 'Carlos Rodríguez',
          category: 'address',
          source: 'client_management'
        },
        {
          id: 'DOC-030',
          name: 'Recent_Bank_Statement.pdf',
          type: 'PDF',
          size: '2.8 MB',
          uploadDate: '2024-01-18',
          uploadedBy: 'Carlos Rodríguez',
          category: 'financial',
          source: 'client_management'
        }
      ]
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadingClient, setUploadingClient] = useState<Client | null>(null)

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'natural' as 'natural' | 'legal',
    serviceType: ''
  })

  const [uploadForm, setUploadForm] = useState({
    category: 'identity' as
      | 'identity'
      | 'address'
      | 'financial'
      | 'legal'
      | 'other',
    description: ''
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || client.type === filterType
    const matchesStatus =
      filterStatus === 'all' || client.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-600">
            Active
          </Badge>
        )
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-600">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'business_review':
        return (
          <Badge variant="default" className="bg-blue-600">
            Business Review
          </Badge>
        )
      case 'compliance_review':
        return (
          <Badge variant="default" className="bg-orange-600">
            Compliance
          </Badge>
        )
      case 'sent_to_government':
        return (
          <Badge variant="default" className="bg-indigo-600">
            Sent to Gov
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
            Uploaded
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
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon className="w-4 h-4 text-green-600" />
      default:
        return <File className="w-4 h-4 text-gray-600" />
    }
  }

  const handleAddClient = () => {
    // Generate new client code
    const nextNumber = clients.length + 1
    const newCode = `CLI-${nextNumber.toString().padStart(3, '0')}`

    const client: Client = {
      id: Date.now().toString(),
      code: newCode,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      type: newClient.type,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'active',
      kycCount: 0,
      serviceTypes: newClient.serviceType ? [newClient.serviceType] : [],
      documentsCount: 0
    }

    setClients([...clients, client])
    setShowAddClient(false)
    setNewClient({
      name: '',
      email: '',
      phone: '',
      type: 'natural',
      serviceType: ''
    })
    alert(`Client ${newCode} registered successfully!`)
  }

  const getClientKycHistory = (clientCode: string) => {
    return kycDocuments.filter(doc => doc.clientCode === clientCode)
  }

  const getAllClientDocuments = (clientCode: string) => {
    const clientKycs = getClientKycHistory(clientCode)
    const allDocuments: UploadedDocument[] = []
    clientKycs.forEach(kyc => {
      allDocuments.push(...kyc.uploadedDocuments)
    })
    return allDocuments
  }

  const handleDownloadDocument = (document: UploadedDocument) => {
    // In a real app, this would trigger a file download
    console.log('Downloading document:', document.name)
    alert(`Downloading ${document.name}`)
  }

  const handleDeleteDocument = (documentId: string, clientCode: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      // Update KYC documents to remove the document
      const updatedKycDocs = kycDocuments.map(kyc => {
        if (kyc.clientCode === clientCode) {
          return {
            ...kyc,
            uploadedDocuments: kyc.uploadedDocuments.filter(
              doc => doc.id !== documentId
            )
          }
        }
        return kyc
      })
      setKycDocuments(updatedKycDocs)

      // Update client document count
      const updatedClients = clients.map(client => {
        if (client.code === clientCode) {
          return {
            ...client,
            documentsCount: client.documentsCount - 1
          }
        }
        return client
      })
      setClients(updatedClients)

      alert('Document deleted successfully')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && uploadingClient) {
      Array.from(files).forEach(file => {
        const newDocument: UploadedDocument = {
          id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: 'Carlos Rodríguez', // Current user
          category: uploadForm.category,
          source: 'client_management'
        }

        // Find the most recent KYC for this client or create a new entry
        const targetKycIndex = kycDocuments.findIndex(
          kyc =>
            kyc.clientCode === uploadingClient.code && kyc.status !== 'approved'
        )

        if (targetKycIndex === -1) {
          // Create a new KYC entry for document management
          const newKyc: KycDocument = {
            id: `KYC-${Date.now()}`,
            clientCode: uploadingClient.code,
            submittedDate: new Date().toISOString().split('T')[0],
            serviceType: 'Document Management',
            status: 'pending_review',
            uploadedDocuments: [newDocument]
          }
          setKycDocuments([...kycDocuments, newKyc])
        } else {
          // Add to existing KYC
          const updatedKycDocs = [...kycDocuments]
          updatedKycDocs[targetKycIndex].uploadedDocuments.push(newDocument)
          setKycDocuments(updatedKycDocs)
        }

        // Update client document count
        const updatedClients = clients.map(client => {
          if (client.code === uploadingClient.code) {
            return {
              ...client,
              documentsCount: client.documentsCount + 1
            }
          }
          return client
        })
        setClients(updatedClients)
      })

      setShowUploadDialog(false)
      setUploadForm({ category: 'identity', description: '' })
      alert(`${files.length} document(s) uploaded successfully!`)
    }
    // Reset the input
    event.target.value = ''
  }

  const openUploadDialog = (client: Client) => {
    setUploadingClient(client)
    setShowUploadDialog(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Client Management
                </h1>
                <p className="text-gray-600">
                  Manage clients, KYC history, and uploaded documents
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Register New Client</DialogTitle>
                    <DialogDescription>
                      Add a new client to the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name / Company Name</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={e =>
                          setNewClient({ ...newClient, name: e.target.value })
                        }
                        placeholder="Enter full name or company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={e =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={e =>
                          setNewClient({ ...newClient, phone: e.target.value })
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Client Type</Label>
                      <Select
                        value={newClient.type}
                        onValueChange={(value: 'natural' | 'legal') =>
                          setNewClient({ ...newClient, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural">
                            Natural Person
                          </SelectItem>
                          <SelectItem value="legal">Legal Entity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service">Initial Service Type</Label>
                      <Select
                        value={newClient.serviceType}
                        onValueChange={value =>
                          setNewClient({ ...newClient, serviceType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tax Advisory">
                            Tax Advisory
                          </SelectItem>
                          <SelectItem value="Legal Consultation">
                            Legal Consultation
                          </SelectItem>
                          <SelectItem value="Business Setup">
                            Business Setup
                          </SelectItem>
                          <SelectItem value="Investment Advisory">
                            Investment Advisory
                          </SelectItem>
                          <SelectItem value="HR Services">
                            HR Services
                          </SelectItem>
                          <SelectItem value="Accounting">Accounting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddClient(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddClient}
                        disabled={!newClient.name || !newClient.email}
                      >
                        Register Client
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" asChild>
                <Link to="/company/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload documents for {uploadingClient?.name} (
              {uploadingClient?.code})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Document Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(
                  value:
                    | 'identity'
                    | 'address'
                    | 'financial'
                    | 'legal'
                    | 'other'
                ) => setUploadForm({ ...uploadForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identity">Identity Documents</SelectItem>
                  <SelectItem value="address">Address Proof</SelectItem>
                  <SelectItem value="financial">Financial Documents</SelectItem>
                  <SelectItem value="legal">Legal Documents</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={uploadForm.description}
                onChange={e =>
                  setUploadForm({ ...uploadForm, description: e.target.value })
                }
                placeholder="Brief description of the documents"
              />
            </div>
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
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
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {clients.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Natural Persons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {clients.filter(c => c.type === 'natural').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Legal Entities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {clients.filter(c => c.type === 'legal').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {clients.reduce(
                  (sum, client) => sum + client.documentsCount,
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
                    placeholder="Search by name, code, or email..."
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>
              Complete list of registered clients with document management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {client.type === 'natural' ? (
                        <User className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Building className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{client.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {client.code}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            client.type === 'natural'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-green-50 text-green-700'
                          }
                        >
                          {client.type === 'natural'
                            ? 'Natural Person'
                            : 'Legal Entity'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {client.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {client.phone}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Registered: {client.registrationDate}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-600">Services:</span>
                        {client.serviceTypes.map((service, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(client.status)}
                    <div className="text-center">
                      <div className="text-sm font-semibold">
                        {client.kycCount}
                      </div>
                      <div className="text-xs text-gray-500">KYC Docs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-orange-600">
                        {client.documentsCount}
                      </div>
                      <div className="text-xs text-gray-500">Documents</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUploadDialog(client)}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Client Details - {client.code}
                          </DialogTitle>
                          <DialogDescription>
                            Complete client information, KYC history, and
                            document management
                          </DialogDescription>
                        </DialogHeader>
                        {selectedClient && (
                          <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="info">
                                Client Info
                              </TabsTrigger>
                              <TabsTrigger value="kyc">KYC History</TabsTrigger>
                              <TabsTrigger value="documents">
                                Documents (
                                {
                                  getAllClientDocuments(selectedClient.code)
                                    .length
                                }
                                )
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Name
                                  </Label>
                                  <p className="font-semibold">
                                    {selectedClient.name}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Client Code
                                  </Label>
                                  <p>{selectedClient.code}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Email
                                  </Label>
                                  <p>{selectedClient.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Phone
                                  </Label>
                                  <p>{selectedClient.phone}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Type
                                  </Label>
                                  <p>
                                    {selectedClient.type === 'natural'
                                      ? 'Natural Person'
                                      : 'Legal Entity'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Status
                                  </Label>
                                  {getStatusBadge(selectedClient.status)}
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Registration Date
                                  </Label>
                                  <p>{selectedClient.registrationDate}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">
                                    Last KYC
                                  </Label>
                                  <p>{selectedClient.lastKycDate || 'Never'}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">
                                  Service Types
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {selectedClient.serviceTypes.map(
                                    (service, index) => (
                                      <Badge key={index} variant="outline">
                                        {service}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="kyc" className="space-y-4">
                              <div className="space-y-3">
                                {getClientKycHistory(selectedClient.code)
                                  .length > 0 ? (
                                  getClientKycHistory(selectedClient.code).map(
                                    doc => (
                                      <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <FileText className="w-5 h-5 text-blue-600" />
                                          <div>
                                            <p className="font-semibold">
                                              {doc.id}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Service: {doc.serviceType}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Submitted: {doc.submittedDate}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Documents:{' '}
                                              {doc.uploadedDocuments.length}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {getKycStatusBadge(doc.status)}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              (window.location.href = `/company/view/${doc.id}`)
                                            }
                                          >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No KYC documents submitted yet</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent
                              value="documents"
                              className="space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">
                                  Client Documents
                                </h3>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    openUploadDialog(selectedClient)
                                  }
                                >
                                  <Upload className="w-4 h-4 mr-1" />
                                  Upload New
                                </Button>
                              </div>
                              <div className="space-y-4">
                                {getAllClientDocuments(selectedClient.code)
                                  .length > 0 ? (
                                  <div className="space-y-3">
                                    {getAllClientDocuments(
                                      selectedClient.code
                                    ).map(document => (
                                      <div
                                        key={document.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                      >
                                        <div className="flex items-center space-x-3">
                                          {getFileIcon(document.type)}
                                          <div>
                                            <p className="font-medium">
                                              {document.name}
                                            </p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                              <span>{document.type}</span>
                                              <span>•</span>
                                              <span>{document.size}</span>
                                              <span>•</span>
                                              <span>
                                                Uploaded: {document.uploadDate}
                                              </span>
                                              <span>•</span>
                                              <span>
                                                By: {document.uploadedBy}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                              {getCategoryBadge(
                                                document.category
                                              )}
                                              {getSourceBadge(document.source)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleDownloadDocument(document)
                                            }
                                          >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download
                                          </Button>
                                          {document.source ===
                                            'client_management' && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteDocument(
                                                  document.id,
                                                  selectedClient.code
                                                )
                                              }
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No documents uploaded yet</p>
                                    <p className="text-sm">
                                      Upload documents to help with compliance
                                      reviews
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
