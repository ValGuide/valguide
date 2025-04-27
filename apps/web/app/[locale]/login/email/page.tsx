'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { useTranslations } from 'next-intl'
import { AuthLayout, MessageAlert, OtpVerificationForm } from '@valguide/ui/components/auth'

export default function EmailLoginPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/console'
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    // Try to get the email from localStorage
    const storedEmail = localStorage.getItem('loginEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    }

    // Check if we have a hash in the URL (from email link)
    const handleEmailSignIn = async () => {
      if (window.location.hash) {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setMessage({ type: 'error', text: error.message })
        } else if (data?.session) {
          // Successfully signed in, redirect to the next page
          router.push(next)
        }
        setLoading(false)
      }
    }

    handleEmailSignIn()
  }, [next, router])

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
    <AuthLayout>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
        <p className="mt-2 text-sm text-gray-600">{email ? `${t('verifyEmail')} ${email}` : t('checkEmail')}</p>
      </div>

      {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}

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
    </AuthLayout>
  )
}
