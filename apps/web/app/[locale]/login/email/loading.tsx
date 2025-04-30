'use client'

import { AuthLayout } from '@valguide/features/auth/common/auth-layout'
import { AuthLoader } from '@valguide/features/auth/common/auth-loader'

export default function EmailLoginLoading() {
  return (
    <AuthLayout>
      <AuthLoader />
    </AuthLayout>
  )
}
