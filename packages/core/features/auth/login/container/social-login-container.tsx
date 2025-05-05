import { SocialLoginButtons } from '../social-login-buttons'
import { Dispatch, SetStateAction } from 'react'
import { createClient } from '@valguide/supabase/client'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

type SocialLoginContainerProps = {
  defaultNextPath: string
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  setMessage: Dispatch<{ type: 'success' | 'error'; text: string } | null>
}

export const SocialLoginContainer = ({
  defaultNextPath,
  loading,
  setLoading,
  setMessage,
}: SocialLoginContainerProps) => {
  const supabase = createClient()
  const t = useTranslations('login')
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? defaultNextPath
  const router = useRouter()

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${next}`,
        },
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        router.push(next)
      }
    } catch (error) {
      console.error('Error with Google login:', error)
      setMessage({ type: 'error', text: t(`${provider}Error`) })
    } finally {
      setLoading(false)
    }
  }
  return (
    <SocialLoginButtons
      onGoogleClick={() => handleOAuthLogin('google')}
      onAppleClick={() => handleOAuthLogin('apple')}
      loading={loading}
      dividerText={t('orContinueWith')}
    />
  )
}
