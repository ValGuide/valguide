'use client'

import { AuthLayout, AuthLoader } from '@valguide/ui/components/auth'

export default function EmailLoginLoading() {
  return (
    <AuthLayout>
      <AuthLoader />
    </AuthLayout>
  )
}
