import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Client } from '@server/routes/clients'

export const Route = createFileRoute('/client')({
  component: Client
})

type Props = {
  client?: Client | null
}

function Client({ client }: Props) {
  const [formData, setFormData] = useState({
    companyName: client?.name || '',
    socialAddress: client?.address || '',
    representatives:
      client?.type === 'legal'
        ? client?.representatives || [{ name: '', role: '' }]
        : [],
    beneficiaries:
      client?.type === 'legal'
        ? client?.beneficiaries || [
            { name: '', directPercentage: 0, indirectPercentage: 0 }
          ]
        : [],
    economicActivity: client?.economicActivity || '',
    operatingCountries:
      client?.type === 'legal' ? client?.operatingCountries || [] : [],
    isPEP: client?.isPEP || false,
    pepDetails: client?.pepDetails || '',
    pepRelation: client?.pepRelation || '',
    fundsOrigin: client?.fundsOrigin || '',
    requestedServices: client?.requestedServices || ''
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" className="mb-4 bg-transparent" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">
            {client ? 'Edit Client' : 'Add New Client'}
          </h1>
          <p className="text-gray-600 mt-2">
            {client
              ? 'Update client information'
              : 'Enter client information for KYC documentation'}
          </p>
        </div>

        {/* AI Parse Status */}
        {/* {aiParseStatus !== 'idle' && (
          <Alert
            className={
              aiParseStatus === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            {aiParseStatus === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                aiParseStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }
            >
              {aiParseMessage}
            </AlertDescription>
          </Alert>
        )} */}

        {/* File Upload Section */}
        {/* <FileUpload
          clientId={client?.id || 'new'}
          files={files}
          onFilesChange={setFiles}
          onParseFiles={handleParseFiles}
        /> */}

        <form
          // onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Company details and address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name (Denominació social)
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      companyName: e.target.value
                    }))
                  }
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialAddress">
                  Social Address (Domicili social)
                </Label>
                <Textarea
                  id="socialAddress"
                  value={formData.socialAddress}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      socialAddress: e.target.value
                    }))
                  }
                  placeholder="Enter complete address"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Representatives */}
          <Card>
            <CardHeader>
              <CardTitle>Representatives (Representants)</CardTitle>
              <CardDescription>
                Legal representatives of the company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.representatives.map((rep, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Name</Label>
                    <Input
                      value={rep.name}
                      // onChange={e =>
                      //   updateRepresentative(index, 'name', e.target.value)
                      // }
                      placeholder="Full name"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Role</Label>
                    <Input
                      value={rep.role}
                      // onChange={e =>
                      //   updateRepresentative(index, 'role', e.target.value)
                      // }
                      placeholder="Position/Role"
                    />
                  </div>
                  {formData.representatives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      // onClick={() => removeRepresentative(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                // onClick={addRepresentative}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Representative
              </Button>
            </CardContent>
          </Card>

          {/* Beneficial Owners */}
          <Card>
            <CardHeader>
              <CardTitle>Beneficial Owners (Beneficiaris efectius)</CardTitle>
              <CardDescription>
                Ultimate beneficial owners with ownership percentages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.beneficiaries.map((ben, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Name</Label>
                    <Input
                      value={ben.name}
                      // onChange={e =>
                      //   updateBeneficiary(index, 'name', e.target.value)
                      // }
                      placeholder="Full name"
                    />
                  </div>
                  <div className="w-32">
                    <Label>Direct %</Label>
                    <Input
                      type="number"
                      value={ben.directPercentage}
                      // onChange={e =>
                      //   updateBeneficiary(
                      //     index,
                      //     'directPercentage',
                      //     Number.parseFloat(e.target.value) || 0
                      //   )
                      // }
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="w-32">
                    <Label>Indirect %</Label>
                    <Input
                      type="number"
                      value={ben.indirectPercentage}
                      // onChange={e =>
                      //   updateBeneficiary(
                      //     index,
                      //     'indirectPercentage',
                      //     Number.parseFloat(e.target.value) || 0
                      //   )
                      // }
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  {formData.beneficiaries.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      // onClick={() => removeBeneficiary(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                // onClick={addBeneficiary}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Beneficial Owner
              </Button>
            </CardContent>
          </Card>

          {/* Business Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Business Activity</CardTitle>
              <CardDescription>
                Economic activity and operational details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="economicActivity">
                  Economic Activity (Activitat econòmica)
                </Label>
                <Textarea
                  id="economicActivity"
                  value={formData.economicActivity}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      economicActivity: e.target.value
                    }))
                  }
                  placeholder="Describe the main economic activity"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatingCountries">Operating Countries</Label>
                <Textarea
                  id="operatingCountries"
                  value={formData.operatingCountries}
                  // onChange={e =>
                  //   setFormData(prev => ({
                  //     ...prev,
                  //     operatingCountries: e.target.value
                  //   }))
                  // }
                  placeholder="Countries where the company operates"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distributionSystems">
                  Distribution Systems
                </Label>
                <Textarea
                  id="distributionSystems"
                  // value={formData.distributionSystems}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      distributionSystems: e.target.value
                    }))
                  }
                  placeholder="Product/service distribution systems"
                />
              </div>
            </CardContent>
          </Card>

          {/* PEP Information */}
          <Card>
            <CardHeader>
              <CardTitle>Politically Exposed Person (PEP)</CardTitle>
              <CardDescription>
                Information about political exposure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPEP"
                  checked={formData.isPEP}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, isPEP: checked }))
                  }
                />
                <Label htmlFor="isPEP">
                  Is this client a Politically Exposed Person?
                </Label>
              </div>
              {formData.isPEP && (
                <div className="space-y-2">
                  <Label htmlFor="pepDetails">PEP Details</Label>
                  <Textarea
                    id="pepDetails"
                    value={formData.pepDetails}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        pepDetails: e.target.value
                      }))
                    }
                    placeholder="Details about political exposure"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="pepRelation">Relation with PEP</Label>
                <Textarea
                  id="pepRelation"
                  value={formData.pepRelation}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      pepRelation: e.target.value
                    }))
                  }
                  placeholder="Any relation with politically exposed persons"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Funds origin and requested services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fundsOrigin">
                  Origin of Funds (Origen dels fons)
                </Label>
                <Textarea
                  id="fundsOrigin"
                  value={formData.fundsOrigin}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      fundsOrigin: e.target.value
                    }))
                  }
                  placeholder="Describe the origin of funds"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedServices">
                  Requested Services (Serveis sol·licitats)
                </Label>
                <Textarea
                  id="requestedServices"
                  value={formData.requestedServices}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      requestedServices: e.target.value
                    }))
                  }
                  placeholder="e.g., Comptabilitat, IGI, IS"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {client ? 'Update Client' : 'Add Client'}
            </Button>

            <Button type="button" variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
