'use client'

import { useEffect, useState } from 'react'
import { getArchivedGuidesAction } from '@valguide/core/features/guides/data-actions'
import { ArchivedGuidesList } from '@/features/guides/components/archived-guides-list'
import { useTranslations } from 'next-intl'
import { GuideWithTranslations } from '@valguide/core/features/guides/schema'

import { ArchivedSkeleton } from './skeleton'

export function ArchivedPageContainer() {
  const t = useTranslations('guides')
  const [data, setData] = useState<{
    guides: GuideWithTranslations[]
    userId: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArchivedGuidesAction().then((res) => {
      if (res) {
        setData(res)
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <ArchivedSkeleton />
  }

  if (!data) {
    return null
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t('archived')}</h1>
      <ArchivedGuidesList guides={data.guides} userId={data.userId} />
    </div>
  )
}
