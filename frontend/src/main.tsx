import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactQueryProvider } from './providers/react-query-provider.tsx'
import { AuthProvider } from './providers/auth-provider.tsx'
import { InnerApp } from './providers/react-query-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactQueryProvider>
      <AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <InnerApp />
      </AuthProvider>
    </ReactQueryProvider>
  </StrictMode>
)
