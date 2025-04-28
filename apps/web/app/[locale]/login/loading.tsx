'use client'

import { AuthLayout, AuthLoader } from '@valguide/ui/components/auth'

export default function LoginLoading() {
  return (
    <AuthLayout>
      <AuthLoader />
    </AuthLayout>
  )
}
