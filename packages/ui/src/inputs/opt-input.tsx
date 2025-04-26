import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/input-otp'

export type OTPInputProps = {
  onComplete?: (...args: any[]) => Promise<void>
  disabled: boolean
}

export const OtpInput = ({ disabled, onComplete }: OTPInputProps) => {
  return (
    <InputOTP maxLength={6} disabled={disabled} onComplete={onComplete}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
