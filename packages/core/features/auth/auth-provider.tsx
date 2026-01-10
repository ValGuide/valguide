import { useSearch } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useTranslations } from '@valguide/core/i18n/client'
import { withLeadingSlash } from '@valguide/i18n/route.utils'
import { createLogger } from '@valguide/logger'
import type React from 'react'
import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext, useState } from 'react'
import { signInWithOtpFn, verifyOtpFn } from './server-functions'

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
  isLogin?: boolean
}>

export const AuthProvider = ({ children, isLogin = false }: AuthProviderProps) => {
  const t = useTranslations(isLogin ? 'login' : 'signup')

  const searchParams = useSearch({ strict: false }) as { next?: string; email?: string }
  const next = withLeadingSlash(searchParams.next ?? defaultNextPath)

  const [loading, setLoading] = useState<boolean>(false)
  const [verifyingOtp, setValidatingOpt] = useState<boolean>(false)
  const [email, setEmail] = useState<string>(searchParams.email ?? '')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [otp, setOtp] = useState('')

  const signInWithOtp = useServerFn(signInWithOtpFn)
  const verifyOtp = useServerFn(verifyOtpFn)

  const handleEmailAuth = async (email: string) => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await signInWithOtp({
        data: {
          email,
          options: {
            emailRedirectTo: `${window.location.origin}${next}`,
          },
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
      const { error } = await verifyOtp({
        data: {
          email,
          token: otp,
          type: 'email',
        },
      })

      if (error) {
        log.error('Error verifying OTP:', error)
        setMessage({ type: 'error', text: error.message })
        setLoading(false)
      } else {
        log.info('OTP verified successfully, clearing cache and navigating...')
        // Keep loading state active during navigation
        window.location.replace(next)
      }
    } catch (error) {
      log.error('Error verifying OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
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
      const { error } = await signInWithOtp({
        data: {
          email,
          options: {
            emailRedirectTo: `${window.location.origin}${next}`,
          },
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
