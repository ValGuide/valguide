'use client'

import { AuthLayout } from '@valguide/features/auth/common/auth-layout'
import { AuthLoader } from '@valguide/features/auth/common/auth-loader'

export default function LoginLoading() {
  return (
    <AuthLayout>
      <AuthLoader />
    </AuthLayout>
  )
}
