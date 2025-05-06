'use client'

import React, { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react'
import { useRouter } from '@valguide/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { SignInWithOAuthAction, SignInWithOtpAction, VerifyOtpAction } from '../actions'

export type LoginMessage = { type: 'success' | 'error'; text: string }

const Context = createContext<{
  loading: boolean
  message: LoginMessage | null
  handleOAuthLogin: (provider: 'google' | 'apple') => Promise<void>
  handleEmailLogin: (email: string) => Promise<void>
  handleVerifyOtp: (e: React.FormEvent) => Promise<void>
  handleResendOtp: () => Promise<void>
  otp: string
  setOtp: Dispatch<SetStateAction<string>>
  verifyingOtp: boolean
  email: string
  setEmail: Dispatch<SetStateAction<string>>
}>({
  loading: false,
  message: null,
  handleOAuthLogin: async () => {},
  handleEmailLogin: async () => {},
  handleResendOtp: async () => {},
  handleVerifyOtp: async () => {},
  otp: '',
  email: '',
  setEmail: () => {},
  setOtp: () => {},
  verifyingOtp: false,
})

const defaultNextPath = '/'

type LoginProviderProps = PropsWithChildren<{
  signInWithOAuthAction: SignInWithOAuthAction
  signInWithOtpAction: SignInWithOtpAction
  verifyOtpAction: VerifyOtpAction
}>

export const LoginProvider = ({
  children,
  signInWithOAuthAction,
  signInWithOtpAction,
  verifyOtpAction,
}: LoginProviderProps) => {
  const t = useTranslations('login')
  const router = useRouter()

  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? defaultNextPath

  const [loading, setLoading] = useState<boolean>(false)
  const [verifyingOtp, setValidatingOpt] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [otp, setOtp] = useState('')

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true)
    try {
      const { error } = await signInWithOAuthAction({
        provider,
        options: {
          redirectTo: `${window.location.origin}${next}`,
        },
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        router.push(next)
      }
    } catch (error) {
      console.error('Error with Google login:', error)
      setMessage({ type: 'error', text: t(`${provider}Error`) })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (email: string) => {
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
        setMessage({ type: 'error', text: error.message })
        setValidatingOpt(false)
      } else {
        setValidatingOpt(true)
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setMessage({ type: 'error', text: t('otpError') })
      setValidatingOpt(false)
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
      const { error } = await verifyOtpAction({
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
      const { error } = await signInWithOtpAction({
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
    <Context.Provider
      value={{
        loading,
        message,
        handleOAuthLogin,
        handleResendOtp,
        handleEmailLogin,
        handleVerifyOtp,
        setOtp,
        otp,
        verifyingOtp,
        email,
        setEmail,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useLogin = () => useContext(Context)
