'use client'

import React, { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react'
import { useRouter } from '@valguide/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { SignInWithOtpAction, VerifyOtpAction } from './actions'
import { createLogger } from '@valguide/logger'
import { withLeadingSlash } from '@valguide/i18n/route.utils'

const log = createLogger('auth-provider')

export type AuthMessage = { type: 'success' | 'error'; text: string }

const Context = createContext<{
  loading: boolean
  message: AuthMessage | null
  handleEmailAuth: (email: string) => Promise<void>
  handleVerifyOtp: (e: React.FormEvent) => Promise<void>
  handleResendOtp: () => Promise<void>
  otp: string
  setOtp: Dispatch<SetStateAction<string>>
  verifyingOtp: boolean
  email: string
  setEmail: Dispatch<SetStateAction<string>>
  isLogin: boolean
}>({
  loading: false,
  message: null,
  handleEmailAuth: async () => {},
  handleResendOtp: async () => {},
  handleVerifyOtp: async () => {},
  otp: '',
  email: '',
  setEmail: () => {},
  setOtp: () => {},
  verifyingOtp: false,
  isLogin: false,
})

const defaultNextPath = '/'

type AuthProviderProps = PropsWithChildren<{
  signInWithOtpAction: SignInWithOtpAction
  verifyOtpAction: VerifyOtpAction
  isLogin?: boolean
}>

export const AuthProvider = ({
  children,
  signInWithOtpAction,
  verifyOtpAction,
  isLogin = false,
}: AuthProviderProps) => {
  const t = useTranslations(isLogin ? 'login' : 'signup')
  const router = useRouter()

  const searchParams = useSearchParams()
  const next = withLeadingSlash(searchParams.get('next') ?? defaultNextPath)

  const [loading, setLoading] = useState<boolean>(false)
  const [verifyingOtp, setValidatingOpt] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [otp, setOtp] = useState('')

  const handleEmailAuth = async (email: string) => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await signInWithOtpAction({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${next}`,
        },
      })

      if (error) {
        log.error('Error sending OTP:', error)
        setMessage({ type: 'error', text: error.message })
        setValidatingOpt(false)
      } else {
        setValidatingOpt(true)
      }
    } catch (error) {
      log.error('Error sending OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
      setValidatingOpt(false)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage({ type: 'error', text: t('emailRequired') })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await verifyOtpAction({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        log.error('Error verifying OTP:', error)
        setMessage({ type: 'error', text: error.message })
      } else {
        // Successfully verified OTP, redirect to the next page
        router.push(next)
      }
    } catch (error) {
      log.error('Error verifying OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      setMessage({ type: 'error', text: t('emailRequired') })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await signInWithOtpAction({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${next}`,
        },
      })

      if (error) {
        log.error('Error resending OTP:', error)
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: t('otpSent') })
      }
    } catch (error) {
      log.error('Error resending OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Context.Provider
      value={{
        loading,
        message,
        handleResendOtp,
        handleEmailAuth,
        handleVerifyOtp,
        setOtp,
        otp,
        verifyingOtp,
        email,
        setEmail,
        isLogin,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useAuth = () => useContext(Context)
