'use client'

import { Button, Container, Heading, TextField } from '@radix-ui/themes'
import { useState, ChangeEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'sign-in') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        if (data?.session) {
          router.push(redirectTo)
          router.refresh()
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        if (data?.user) {
          // Show success message for email verification
          setError('Please check your email to verify your account')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container size="1" className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Heading size="4" align="center">
          {mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </Heading>

        <div className="space-y-2">
          <TextField.Root>
            <TextField.Slot>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent outline-none"
              />
            </TextField.Slot>
          </TextField.Root>

          <TextField.Root>
            <TextField.Slot>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent outline-none"
              />
            </TextField.Slot>
          </TextField.Root>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? 'Loading...'
            : mode === 'sign-in'
            ? 'Sign In'
            : 'Sign Up'}
        </Button>
      </form>
    </Container>
  )
} 