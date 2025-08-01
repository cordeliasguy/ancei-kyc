import { createContext } from 'react'
import { authClient } from '../lib/auth-client'

export const AuthCtx = createContext<ReturnType<typeof authClient.useSession>>(
  null!
)
