import { i18nStaticParams } from '@/i18n/i18n.config'

export const dynamic = 'error'

export const dynamicParams = false

export const generateStaticParams = () => i18nStaticParams

export default async function Page() {
  return (
    <div>
      <main className="flex flex-col flex-1 items-center justify-center gap-4">
        <article className="prose max-w-2xl">
          <h1 className="text-6xl font-bold text-center">Demo Console</h1>
        </article>

        <div>Create todo</div>
      </main>
    </div>
  )
}
