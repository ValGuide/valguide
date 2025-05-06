import { AuthLayout } from '../common/auth-layout'
import { AuthLoader } from '../common/auth-loader'

export default function LoginLoading() {
  return (
    <AuthLayout>
      <AuthLoader />
    </AuthLayout>
  )
}
