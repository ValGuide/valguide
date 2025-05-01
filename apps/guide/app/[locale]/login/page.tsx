'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { useTranslations } from 'next-intl'
import { AuthLayout } from '@valguide/features/auth/common/auth-layout'
import { MessageAlert } from '@valguide/features/auth/common/message-alert'
import { LoginForm } from '@valguide/features/auth/login/login-form'
import { SocialLoginButtons } from '@valguide/features/auth/login/social-login-buttons'

export default function LoginPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/console'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleEmailLogin = async (email: string) => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${next}`,
        },
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        // Store email in localStorage for the verification page
        localStorage.setItem('loginEmail', email)
        // Redirect to the email verification page
        router.push(`${window.location.pathname}/email${next ? `?next=${encodeURIComponent(next)}` : ''}`)
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${next}`,
        },
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      }
    } catch (error) {
      console.error('Error with Google login:', error)
      setMessage({ type: 'error', text: t('googleError') })
    } finally {
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}${next}`,
        },
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      }
    } catch (error) {
      console.error('Error with Apple login:', error)
      setMessage({ type: 'error', text: t('appleError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('loginPrompt')}</p>
      </div>

      {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}

      <LoginForm
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleEmailLogin}
        loading={loading}
        submitText={t('sendCode')}
        loadingText={t('sending')}
        emailLabel={t('emailLabel')}
        emailPlaceholder={t('emailPlaceholder')}
      />

      <SocialLoginButtons
        onGoogleClick={handleGoogleLogin}
        onAppleClick={handleAppleLogin}
        loading={loading}
        dividerText={t('orContinueWith')}
      />
    </AuthLayout>
  )
}
