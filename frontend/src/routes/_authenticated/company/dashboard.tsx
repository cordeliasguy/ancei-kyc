import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Users, Search, Filter } from 'lucide-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  getAllKycDocumentsFromAgencyQueryOptions,
  getExpiringDocumentsQueryOptions,
  getUserQueryOptions
} from '@/lib/api'
import { getServiceLabel } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { KycStatus } from '@server/sharedTypes'
import { UserProfileDialog } from '@/components/user-profile-dialog'
import { ExpiringDocumentsBadge } from '@/components/expiring-documents-badge'

export const Route = createFileRoute('/_authenticated/company/dashboard')({
  component: CompanyDashboard
})

function CompanyDashboard() {
  const navigate = useNavigate()

  const { data: kycDocuments, isPending } = useQuery(
    getAllKycDocumentsFromAgencyQueryOptions
  )

  const { data: expiringDocuments } = useQuery(
    getExpiringDocumentsQueryOptions()
  )

  const { data: session } = useQuery(getUserQueryOptions)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredDocuments = kycDocuments?.filter(doc => {
    const term = searchTerm.toLowerCase().trim()

    const name = doc.type === 'legal' ? doc.companyName : doc.fullName
    const email = doc.type === 'legal' ? doc.companyEmail : doc.email

    const matchesSearch =
      (name ?? '').toLowerCase().includes(term) ||
      (email ?? '').toLowerCase().includes(term)

    const matchesType = filterType === 'all' || doc.type === filterType

    return matchesSearch && matchesType
  })

  const getDocumentsByStatus = (status: string) => {
    return filteredDocuments?.filter(doc => doc.status === status) || []
  }

  const kanbanColumns = [
    {
      id: 'submitted',
      title: 'Pendent de revisió del responsable',
      color: 'bg-gray-100',
      count: getDocumentsByStatus('submitted').length
    },
    {
      id: 'responsible_reviewed',
      title: 'Pendent de revisió del compliance',
      color: 'bg-blue-50',
      count: getDocumentsByStatus('responsible_reviewed').length
    },
    {
      id: 'compliance_reviewed',
      title: "Pendent de revisió de l'ocic",
      color: 'bg-orange-50',
      count: getDocumentsByStatus('compliance_reviewed').length
    }
    // {
    //   id: 'completed',
    //   title: 'Completat',
    //   color: 'bg-green-50',
    //   count: getDocumentsByStatus('completed').length
    // }
  ]

  const handleOnDocumentClick = (docId: string, docStatus: KycStatus) => {
    if (!session) return

    const userRole = session.user.role

    const routes: Record<string, string> = {
      submitted: `/company/review/${docId}`,
      responsible_reviewed: `/company/compliance/${docId}`,
      compliance_reviewed: `/company/ocic/${docId}`
    }

    const roleAccess: Record<string, KycStatus[]> = {
      responsible: ['submitted'],
      compliance: ['submitted', 'responsible_reviewed'],
      ocic: ['submitted', 'responsible_reviewed', 'compliance_reviewed'],
      admin: ['submitted', 'responsible_reviewed', 'compliance_reviewed']
    }

    // Check if user has access to this document status
    const allowedStatuses = roleAccess[userRole]
    if (!allowedStatuses?.includes(docStatus)) {
      navigate({ to: `/company/view/${docId}` })
      return
    }

    const route = routes[docStatus]
    if (route) navigate({ to: route })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tauler Empresa
              </h1>
              <p className="text-gray-600">
                Gestiona les revisions i el compliment de documents KYC
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="size-4 mr-1" />
                  Tornar a l'inici
                </Link>
              </Button> */}

              <Button variant="outline" asChild>
                <Link to="/company/clients">
                  <Users className="w-4 h-4 mr-1" />
                  Gestionar Clients
                </Link>
              </Button>

              <UserProfileDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        {/* Filters */}
        <Card className="gap-3 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtres
              </div>

              <ExpiringDocumentsBadge expiringDocuments={expiringDocuments} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cerca per nom de client o correu electrònic..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={isPending}
                  />
                </div>
              </div>
              <Select
                value={filterType}
                onValueChange={setFilterType}
                disabled={isPending}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tots els tipus</SelectItem>
                  <SelectItem value="natural">Persona Física</SelectItem>
                  <SelectItem value="legal">Persona Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          {isPending && (
            <>
              <Skeleton className="size-full rounded-xl" />
              <Skeleton className="size-full rounded-xl" />
              <Skeleton className="size-full rounded-xl" />
            </>
          )}

          {!isPending &&
            kanbanColumns.map(column => (
              <Card key={column.id} className={`${column.color} min-h-96`}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{column.title}</span>
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-gray-100 rounded-full"
                    >
                      {column.count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {getDocumentsByStatus(column.id).map(doc => (
                    <Card
                      key={doc.id}
                      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer py-2"
                    >
                      <CardContent
                        className="p-3"
                        onClick={() =>
                          handleOnDocumentClick(doc.id, doc.status)
                        }
                      >
                        <div className="space-y-2">
                          <div className="flex justify-end">
                            <Badge
                              variant="outline"
                              className={`rounded-full
                              ${
                                doc.type === 'natural'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-green-50 text-green-700'
                              }`}
                            >
                              {doc.type === 'natural'
                                ? 'P. Física'
                                : 'P. Jurídica'}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm shrink-0">
                            {doc.type === 'natural'
                              ? doc.fullName
                              : doc.companyName}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Servei/s:{' '}
                            {doc.services.map(getServiceLabel).join(', ')}
                          </p>
                          <div className="flex justify-end">
                            <span className="text-xs text-gray-500">
                              {new Date(doc.updatedAt).toLocaleString()}
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
      </div>
    </div>
  )
}
