import { useAuth } from '../auth-provider'
import { AuthContainer } from '../common/auth-container'

export default function LoginContainer() {
  const {
    handleEmailAuth,
    handleVerifyOtp,
    otp,
    setOtp,
    handleResendOtp,
    handleChangeEmail,
    loading,
    message,
    verifyingOtp,
    email,
    setEmail,
  } = useAuth()

  return (
    <AuthContainer
      email={email}
      setEmail={setEmail}
      otp={otp}
      setOtp={setOtp}
      handleEmailAuth={handleEmailAuth}
      handleVerifyOtp={handleVerifyOtp}
      handleResendOtp={handleResendOtp}
      handleChangeEmail={handleChangeEmail}
      loading={loading}
      message={message}
      verifyingOtp={verifyingOtp}
    />
  )
}
