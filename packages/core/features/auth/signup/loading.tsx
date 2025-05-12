import { AuthLayout } from '../common/auth-layout'
import { AuthSkeletonContainer } from '../common/auth-skeleton-container'

export default function SignupLoading() {
  return (
    <AuthLayout>
      <AuthSkeletonContainer />
    </AuthLayout>
  )
}
