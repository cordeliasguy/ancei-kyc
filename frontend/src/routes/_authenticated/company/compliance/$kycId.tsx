import { createFileRoute } from '@tanstack/react-router'
import { DocumentView } from '@/components/document-view'

export const Route = createFileRoute(
  '/_authenticated/company/compliance/$kycId'
)({
  component: ComplianceDocumentView
})

function ComplianceDocumentView() {
  return <DocumentView />
}
