'use client'

import { Container, Heading } from '@radix-ui/themes'
import { AuthForm } from '../../components/auth/AuthForm'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function SignUp() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  return (
    <Container size="1" className="max-w-md mx-auto p-4">
      <Heading size="4" align="center" className="mb-4">
        Create an Account
      </Heading>
      <AuthForm mode="sign-up" />
    </Container>
  )
} 