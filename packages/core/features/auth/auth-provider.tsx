import { useSearch } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { sanitizeRedirectPath } from '@valguide/core/utils/sanitize-redirect-path'
import { createLogger } from '@valguide/logger'
import type React from 'react'
import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext, useState } from 'react'
import { authClient } from './better-auth-client'

const log = createLogger('auth-provider')

export type AuthMessage = { type: 'success' | 'error'; text: string }

const Context = createContext<{
  loading: boolean
  message: AuthMessage | null
  handleEmailAuth: (email: string) => Promise<void>
  handleVerifyOtp: (e: React.FormEvent) => Promise<void>
  handleResendOtp: () => Promise<void>
  handleChangeEmail: () => void
  otp: string
  setOtp: Dispatch<SetStateAction<string>>
  verifyingOtp: boolean
  email: string
  setEmail: Dispatch<SetStateAction<string>>
  emailLocked: boolean
}>({
  loading: false,
  message: null,
  handleEmailAuth: async () => {},
  handleResendOtp: async () => {},
  handleVerifyOtp: async () => {},
  handleChangeEmail: () => {},
  otp: '',
  email: '',
  setEmail: () => {},
  setOtp: () => {},
  verifyingOtp: false,
  emailLocked: false,
})

const defaultNextPath = '/'

type BetterAuthErrorLike = {
  message?: string
  status?: number
  code?: string
  response?: {
    headers?: {
      get?: (name: string) => string | null
    }
  }
  body?: {
    message?: string
    status?: number
    code?: string
    retryAfter?: number
    retryAfterSeconds?: number
  }
  error?: {
    message?: string
    retryAfter?: number
    retryAfterSeconds?: number
    headers?: Record<string, unknown>
  }
  headers?: Record<string, unknown>
}

function getRetryAfterFromHeaders(headers: Headers | undefined): number | null {
  const values = [headers?.get('x-retry-after'), headers?.get('retry-after')]
  for (const value of values) {
    if (!value) {
      continue
    }
    const parsed = Number(value)
    if (!Number.isNaN(parsed) && parsed > 0) {
      return Math.ceil(parsed)
    }
  }
  return null
}

function readHeaderValue(headersLike: unknown, headerName: string): string | null {
  if (!headersLike || typeof headersLike !== 'object') {
    return null
  }

  const maybeHeaders = headersLike as {
    get?: (name: string) => string | null
    [key: string]: unknown
  }

  if (typeof maybeHeaders.get === 'function') {
    const value = maybeHeaders.get(headerName)
    if (value) {
      return value
    }
  }

  const lowerHeader = headerName.toLowerCase()
  for (const [key, value] of Object.entries(maybeHeaders)) {
    if (key.toLowerCase() === lowerHeader && typeof value === 'string') {
      return value
    }
  }

  return null
}

function parseRetryAfterSeconds(error: BetterAuthErrorLike): number | null {
  const bodyRetry =
    error.body?.retryAfterSeconds ?? error.body?.retryAfter ?? error.error?.retryAfterSeconds ?? error.error?.retryAfter
  if (typeof bodyRetry === 'number' && Number.isFinite(bodyRetry) && bodyRetry > 0) {
    return Math.ceil(bodyRetry)
  }

  const retryAfterHeaders = [
    readHeaderValue(error.response?.headers, 'x-retry-after'),
    readHeaderValue(error.response?.headers, 'retry-after'),
    readHeaderValue(error.headers, 'x-retry-after'),
    readHeaderValue(error.headers, 'retry-after'),
    readHeaderValue(error.error?.headers, 'x-retry-after'),
    readHeaderValue(error.error?.headers, 'retry-after'),
  ]

  console.log('Parsing retry after headers:', error.response?.headers)
  for (const retryAfterHeader of retryAfterHeaders) {
    if (!retryAfterHeader) {
      continue
    }
    const asNumber = Number(retryAfterHeader)
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      return Math.ceil(asNumber)
    }
  }

  const message = error.message ?? error.body?.message ?? ''
  const secondsMatch = message.match(/(\d+)\s*(seconds?|secs?|s)\b/i)
  if (secondsMatch) {
    return Number(secondsMatch[1])
  }

  const minutesMatch = message.match(/(\d+)\s*(minutes?|mins?|m)\b/i)
  if (minutesMatch) {
    return Number(minutesMatch[1]) * 60
  }

  return null
}

function formatRateLimitMessage(
  retryAfterSeconds: number,
  formatters: {
    second: (seconds: number) => string
    seconds: (seconds: number) => string
    minute: (minutes: number) => string
    minutes: (minutes: number) => string
    minuteSecond: (minutes: number, seconds: number) => string
    minuteSeconds: (minutes: number, seconds: number) => string
    minutesSecond: (minutes: number, seconds: number) => string
    minutesSeconds: (minutes: number, seconds: number) => string
  },
): string {
  const totalSeconds = Math.max(1, Math.ceil(retryAfterSeconds))
  if (totalSeconds < 60) {
    return totalSeconds === 1 ? formatters.second(totalSeconds) : formatters.seconds(totalSeconds)
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (seconds === 0) {
    return minutes === 1 ? formatters.minute(minutes) : formatters.minutes(minutes)
  }

  if (minutes === 1 && seconds === 1) {
    return formatters.minuteSecond(minutes, seconds)
  }
  if (minutes === 1) {
    return formatters.minuteSeconds(minutes, seconds)
  }
  if (seconds === 1) {
    return formatters.minutesSecond(minutes, seconds)
  }
  return formatters.minutesSeconds(minutes, seconds)
}

function getAuthErrorMessage(
  error: unknown,
  fallback: string,
  attemptsMessage: string,
  fallbackRateLimitSeconds: number,
  rateLimitFormatters: {
    second: (seconds: number) => string
    seconds: (seconds: number) => string
    minute: (minutes: number) => string
    minutes: (minutes: number) => string
    minuteSecond: (minutes: number, seconds: number) => string
    minuteSeconds: (minutes: number, seconds: number) => string
    minutesSecond: (minutes: number, seconds: number) => string
    minutesSeconds: (minutes: number, seconds: number) => string
  },
): string {
  const authError = (error ?? {}) as BetterAuthErrorLike
  const code = authError.code ?? authError.body?.code
  const status = authError.status ?? authError.body?.status
  const message = authError.message ?? authError.body?.message

  if (status === 429 || code === 'TOO_MANY_REQUESTS') {
    const retryAfterSeconds = parseRetryAfterSeconds(authError) ?? fallbackRateLimitSeconds
    return formatRateLimitMessage(retryAfterSeconds, rateLimitFormatters)
  }
  if (code === 'TOO_MANY_ATTEMPTS') {
    return attemptsMessage
  }
  return message ?? fallback
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const t = useTranslations('auth')
  const rateLimitFormatters = {
    second: (seconds: number) => t('rateLimitErrorWithSecond', { seconds }),
    seconds: (seconds: number) => t('rateLimitErrorWithSeconds', { seconds }),
    minute: (minutes: number) => t('rateLimitErrorWithMinute', { minutes }),
    minutes: (minutes: number) => t('rateLimitErrorWithMinutes', { minutes }),
    minuteSecond: (minutes: number, seconds: number) => t('rateLimitErrorWithMinuteSecond', { minutes, seconds }),
    minuteSeconds: (minutes: number, seconds: number) => t('rateLimitErrorWithMinuteSeconds', { minutes, seconds }),
    minutesSecond: (minutes: number, seconds: number) => t('rateLimitErrorWithMinutesSecond', { minutes, seconds }),
    minutesSeconds: (minutes: number, seconds: number) => t('rateLimitErrorWithMinutesSeconds', { minutes, seconds }),
  }

  const searchParams = useSearch({ strict: false }) as { next?: string; email?: string }
  const next = sanitizeRedirectPath(searchParams.next ?? defaultNextPath)
  const emailLocked = !!searchParams.email

  const [loading, setLoading] = useState<boolean>(false)
  const [verifyingOtp, setValidatingOpt] = useState<boolean>(false)
  const [email, setEmail] = useState<string>(searchParams.email ?? '')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [otp, setOtp] = useState('')

  const handleEmailAuth = async (email: string) => {
    setLoading(true)
    setMessage(null)
    let retryAfterSecondsFromResponse: number | null = null

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
        fetchOptions: {
          onError: async (context: { response: Response }) => {
            retryAfterSecondsFromResponse = getRetryAfterFromHeaders(context.response.headers)
          },
        },
      })

      if (error) {
        log.error('Error sending OTP:', error)
        setMessage({
          type: 'error',
          text: getAuthErrorMessage(
            error,
            t('otpError'),
            t('tooManyAttemptsError'),
            retryAfterSecondsFromResponse ?? 60,
            rateLimitFormatters,
          ),
        })
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
    let retryAfterSecondsFromResponse: number | null = null

    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
        fetchOptions: {
          onError: async (context: { response: Response }) => {
            retryAfterSecondsFromResponse = getRetryAfterFromHeaders(context.response.headers)
          },
        },
      })

      if (error) {
        log.error('Error verifying OTP:', error)
        setMessage({
          type: 'error',
          text: getAuthErrorMessage(
            error,
            t('verificationError'),
            t('tooManyAttemptsError'),
            retryAfterSecondsFromResponse ?? 60,
            rateLimitFormatters,
          ),
        })
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
    let retryAfterSecondsFromResponse: number | null = null

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
        fetchOptions: {
          onError: async (context: { response: Response }) => {
            retryAfterSecondsFromResponse = getRetryAfterFromHeaders(context.response.headers)
          },
        },
      })

      if (error) {
        log.error('Error resending OTP:', error)
        setMessage({
          type: 'error',
          text: getAuthErrorMessage(
            error,
            t('otpError'),
            t('tooManyAttemptsError'),
            retryAfterSecondsFromResponse ?? 60,
            rateLimitFormatters,
          ),
        })
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

  const handleChangeEmail = () => {
    setValidatingOpt(false)
    setOtp('')
    setMessage(null)
  }

  return (
    <Context.Provider
      value={{
        loading,
        message,
        handleResendOtp,
        handleEmailAuth,
        handleVerifyOtp,
        handleChangeEmail,
        setOtp,
        otp,
        verifyingOtp,
        email,
        setEmail,
        emailLocked,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useAuth = () => useContext(Context)
