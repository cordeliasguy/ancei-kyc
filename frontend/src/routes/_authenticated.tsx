import { userQueryOptions } from '@/lib/api'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const { queryClient } = context

    try {
      const data = await queryClient.fetchQuery(userQueryOptions)
      return data
    } catch {
      throw redirect({
        to: '/company/login'
      })
    }
  }
})
