import { AuthCtx } from '@/contexts/auth-context'
import { authClient } from '@/lib/auth-client'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const session = authClient.useSession()
  return <AuthCtx.Provider value={session}>{children}</AuthCtx.Provider>
}
