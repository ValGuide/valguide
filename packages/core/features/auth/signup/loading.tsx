import { AuthLayout } from '../common/auth-layout'
import { AuthLoader } from '../common/auth-loader'

export default function SignupLoading() {
  return (
    <AuthLayout>
      <AuthLoader />
    </AuthLayout>
  )
}
