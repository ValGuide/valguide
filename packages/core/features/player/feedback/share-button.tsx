import { useTranslations } from '@valguide/core/i18n/client'
import { Check, Copy, Share2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '../../../ui/components/button'

type ShareButtonProps = {
  url: string
  title: string
  text?: string
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const t = useTranslations('player.share')
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState<boolean | null>(null)

  // Check for native share on mount (client-side only)
  if (canShare === null && typeof window !== 'undefined') {
    setCanShare(typeof navigator.share === 'function')
  }

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, text, url })
    } catch {
      // User cancelled or error - ignore
    }
  }, [title, text, url])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [url])

  // If native share is available, use a simple button
  if (canShare) {
    return (
      <Button variant="outline" size="sm" onClick={handleNativeShare}>
        <Share2 className="h-4 w-4 mr-2" />
        {t('title')}
      </Button>
    )
  }

  // Fallback: copy link button
  return (
    <Button variant="outline" size="sm" onClick={handleCopyLink}>
      {copied ? <Check className="h-4 w-4 mr-2 text-success" /> : <Copy className="h-4 w-4 mr-2" />}
      {copied ? t('linkCopied') : t('copyLink')}
    </Button>
  )
}
