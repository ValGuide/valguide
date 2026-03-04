import type { MaintenancePageI18n } from './i18n'

export type MaintenancePageProps = {
  appName: string
  i18n: MaintenancePageI18n
  message: string | null
  eta: string | null
}

export function MaintenancePage({ appName, i18n, message, eta }: MaintenancePageProps) {
  return (
    <main>
      <article>
        <p className="eyebrow">{appName}</p>
        <h1>{i18n.title}</h1>
        <p className="message">{message ?? i18n.description}</p>
        {eta ? <p className="eta">{i18n.estimatedEnd.replace('{time}', eta)}</p> : null}
        <p className="hint">{i18n.retryHint}</p>
      </article>
    </main>
  )
}
