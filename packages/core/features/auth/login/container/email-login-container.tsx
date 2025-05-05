import { LoginForm } from '../login-form'
import { createClient } from '@valguide/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { OtpVerificationForm } from '../otp-verification-form'
import { useTranslations } from 'next-intl'

type EmailLoginContainerProps = {
  defaultNextPath: string
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  setMessage: Dispatch<SetStateAction<{ type: 'success' | 'error'; text: string } | null>>
  email: string
  setEmail: Dispatch<SetStateAction<string>>
}

export const EmailLoginContainer = ({
  defaultNextPath,
  loading,
  setLoading,
  setMessage,
  setEmail,
  email,
}: EmailLoginContainerProps) => {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [otp, setOtp] = useState('')
  const next = searchParams.get('next') ?? defaultNextPath
  const t = useTranslations('login')

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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage({ type: 'error', text: 'Email is required' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        // Successfully verified OTP, redirect to the next page
        router.push(next)
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email is required' })
      return
    }

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
        setMessage({ type: 'success', text: t('otpSent') })
      }
    } catch (error) {
      console.error('Error resending OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {email ? (
        <OtpVerificationForm
          otp={otp}
          onOtpChange={(e) => setOtp(e.target.value)}
          onSubmit={handleVerifyOtp}
          onResendClick={handleResendOtp}
          loading={loading}
          submitText={t('verifyCode')}
          loadingText={t('verifying')}
          otpLabel={t('otpLabel')}
          otpPlaceholder={t('otpPlaceholder')}
          resendText={t('resendCode')}
        />
      ) : (
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
      )}
    </>
  )
}
