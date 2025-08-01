import { AuthCtx } from '@/contexts/auth-context'
import { useContext } from 'react'

export const useAuth = () => useContext(AuthCtx)
