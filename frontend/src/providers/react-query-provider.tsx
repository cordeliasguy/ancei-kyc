import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

const queryClient = new QueryClient()

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const router = createRouter({
  routeTree,
  context: {
    queryClient
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const InnerApp = () => {
  return <RouterProvider router={router} />
}
