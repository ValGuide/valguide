import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@valguide/ui/components/input-otp'
import { useCallback, useEffect, useState } from 'react'

type JoinTeamOtpFormProps = {
  email: string
  onSendOtp: () => Promise<void>
  onVerifyOtp: (otp: string) => Promise<void>
}

type FormState = 'idle' | 'sending' | 'sent' | 'verifying'

const RESEND_COOLDOWN = 60

export function JoinTeamOtpForm({ email, onSendOtp, onVerifyOtp }: JoinTeamOtpFormProps) {
  const t = useTranslations('joinTeam')
  const [state, setState] = useState<FormState>('idle')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSendOtp = useCallback(async () => {
    setState('sending')
    setError(null)
    try {
      await onSendOtp()
      setState('sent')
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
      setState('idle')
    }
  }, [onSendOtp])

  const handleResend = useCallback(async () => {
    setError(null)
    setCooldown(RESEND_COOLDOWN)
    try {
      await onSendOtp()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    }
  }, [onSendOtp])

  const handleVerify = useCallback(
    async (code: string) => {
      if (code.length !== 6) return
      setState('verifying')
      setError(null)
      try {
        await onVerifyOtp(code)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed')
        setState('sent')
        setOtp('')
      }
    },
    [onVerifyOtp],
  )

  if (state === 'idle' || (state === 'sending' && !error)) {
    return (
      <div className="space-y-3">
        <Button className="w-full" onClick={handleSendOtp} disabled={state === 'sending'}>
          {state === 'sending' ? '…' : t('public.sendCode')}
        </Button>
        {error && <ErrorMessage message={error} />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">{t('public.codeSent', { email })}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleVerify(otp)
        }}
        className="space-y-4"
      >
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            disabled={state === 'verifying'}
            containerClassName="gap-2 sm:gap-4 justify-center"
            value={otp}
            onChange={setOtp}
            onComplete={(value) => {
              handleVerify(value)
            }}
          >
            <InputOTPGroup className="gap-1.5 sm:gap-2.5 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-10 sm:*:data-[slot=input-otp-slot]:h-16 sm:*:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-lg sm:*:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup className="gap-1.5 sm:gap-2.5 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-10 sm:*:data-[slot=input-otp-slot]:h-16 sm:*:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-lg sm:*:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <ErrorMessage message={error} />}

        <Button type="submit" className="w-full" disabled={otp.length !== 6 || state === 'verifying'}>
          {state === 'verifying' ? t('public.verifying') : t('public.verify')}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {cooldown > 0 ? (
          <span>{t('public.resendIn', { seconds: cooldown })}</span>
        ) : (
          <button type="button" className="font-medium hover:underline" onClick={handleResend}>
            {t('public.resend')}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">{t('public.notYou')}</p>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">{message}</div>
}
