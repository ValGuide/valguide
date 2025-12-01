// biome-ignore lint/style/noRestrictedImports: redirect is only available from next/navigation
import { redirect } from 'next/navigation'

interface StopEditPageParams {
  locale: string
  nanoId: string
  stopId: string
}

export default async function StopEditPage({ params }: { params: Promise<StopEditPageParams> }) {
  const { locale, nanoId, stopId } = await params

  // Redirect to the unified edit page with stop query param
  redirect(`/${locale}/guides/${nanoId}/edit?stop=${stopId}`)
}
