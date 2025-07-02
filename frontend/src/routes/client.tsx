import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client')({
  component: Client
})

function Client() {
  return <div>Hello "/clients"!</div>
}
