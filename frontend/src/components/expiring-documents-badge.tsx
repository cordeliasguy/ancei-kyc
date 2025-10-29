import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

type ExpiringDocument = {
  id: string
  name: string
  clientName: string
  expiresAt: string
}

export function ExpiringDocumentsBadge({
  expiringDocuments
}: {
  expiringDocuments?: ExpiringDocument[]
}) {
  const [open, setOpen] = useState(false)

  if (!expiringDocuments) return null

  const count = expiringDocuments.length
  const plural = count > 1

  const badgeText =
    count > 0
      ? `Hi ha ${count} document${plural ? 's' : ''} pròxim${plural ? 's' : ''} a caducar`
      : 'No hi ha documents pròxims a caducar'

  const badgeClass =
    count > 0
      ? `bg-orange-50 text-orange-700 border-orange-200 cursor-pointer 
         hover:bg-orange-100 transition-colors duration-200`
      : `bg-green-50 text-green-700 border-green-200`

  return (
    <>
      <div className="mt-2 flex items-center space-x-2">
        <Badge
          variant="outline"
          className={badgeClass}
          onClick={() => count > 0 && setOpen(true)}
        >
          {badgeText}
        </Badge>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Documents pròxims a caducar</DialogTitle>
            <DialogDescription>
              Llista de documents que caduquen en els pròxims 30 dies.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-80">
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}{' '}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}{' '}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}{' '}
            {expiringDocuments.map(doc => (
              <div
                key={doc.id}
                className="rounded-lg border border-orange-100 bg-orange-50/30 p-3 text-sm"
              >
                <p className="font-medium text-orange-800">{doc.name}</p>
                <p className="text-orange-700">
                  Client:{' '}
                  <span className="font-semibold">{doc.clientName}</span>
                </p>
                <p className="text-orange-600">
                  Caduca el{' '}
                  <span className="font-medium">
                    {new Date(doc.expiresAt).toLocaleDateString('ca-ES')}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
