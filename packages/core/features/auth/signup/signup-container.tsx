import { useAuth } from '../auth-provider'
import { AuthContainer } from '../common/auth-container'

export default function SignupContainer() {
  const {
    handleEmailAuth,
    handleVerifyOtp,
    otp,
    setOtp,
    handleResendOtp,
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
      loading={loading}
      message={message}
      verifyingOtp={verifyingOtp}
      isLogin={false}
    />
  )
}
