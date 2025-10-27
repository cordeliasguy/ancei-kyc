import { createFileRoute } from '@tanstack/react-router'
import { DocumentView } from '@/components/document-view'

export const Route = createFileRoute('/_authenticated/company/review/$kycId')({
  component: ResponsibleDocumentView
})

function ResponsibleDocumentView() {
  return <DocumentView />
}
