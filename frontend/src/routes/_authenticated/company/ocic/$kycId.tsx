import { createFileRoute } from '@tanstack/react-router'
import { DocumentView } from '@/components/document-view'

export const Route = createFileRoute('/_authenticated/company/ocic/$kycId')({
  component: OcicDocumentView
})

function OcicDocumentView() {
  return <DocumentView />
}
