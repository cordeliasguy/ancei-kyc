import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, LogIn } from 'lucide-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { InputContainer } from '@/components/input-container'
import { authClient } from '@/lib/auth-client'
import z from 'zod'

export const Route = createFileRoute('/company/login/')({
  component: CompanyLogin
})

function CompanyLogin() {
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState('')

  const isValidEmail = z.email().safeParse(credentials.email).success
  const isValidPassword = z
    .string()
    .min(8)
    .safeParse(credentials.password).success
  const areCredentialsValid = isValidEmail && isValidPassword

  // const handleSignUp = async () => {
  //   await authClient.signUp
  //     .email({
  //       email: 'company@ancei.com',
  //       password: '12345678',
  //       name: 'Test Admin'
  //     })
  //     .then(() => navigate({ to: '/company/dashboard' }))

  //   console.log('SIGNED UP!')
  // }

  const handleOnSignIn = async () => {
    setError('')
    setIsSigningIn(true)

    await authClient.signIn
      .email(
        {
          email: credentials.email,
          password: credentials.password
        },
        {
          onSuccess: () => navigate({ to: '/company/dashboard' }),
          onError: res => setError(res.error.message)
        }
      )
      .finally(() => setIsSigningIn(false))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Company Portal</CardTitle>
          <CardDescription>
            Access your company dashboard to review, validate and manage KYC
            documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputContainer>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={credentials.email}
              onChange={e =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              placeholder="company@ancei.com"
              autoFocus
            />
          </InputContainer>

          <InputContainer>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={e =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
          </InputContainer>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

          <Button
            onClick={handleOnSignIn}
            disabled={!areCredentialsValid || isSigningIn}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <LogIn className="w-4 h-4 mr-1" />
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
