import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://convinced-sophronia-cordelia-38f9cb9e.koyeb.app/'
})
