'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MessageAlert } from '../../common/message-alert'
import { SocialLoginContainer } from './social-login-container'
import { EmailLoginContainer } from './email-login-container'

export default function LoginContainer() {
  const t = useTranslations('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [email, setEmail] = useState('')
  const defaultNextPath = '/'

  return (
    <>
      {email ? (
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
          <p className="mt-2 text-sm text-gray-600">{email ? `${t('verifyEmail')} ${email}` : t('checkEmail')}</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('loginPrompt')}</p>
        </div>
      )}
      {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}
      <EmailLoginContainer
        defaultNextPath={defaultNextPath}
        setLoading={setLoading}
        loading={loading}
        setMessage={setMessage}
        setEmail={setEmail}
        email={email}
      />
      <SocialLoginContainer
        defaultNextPath={defaultNextPath}
        setLoading={setLoading}
        loading={loading}
        setMessage={setMessage}
      />
    </>
  )
}
