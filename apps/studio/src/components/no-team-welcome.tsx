import { CreateTeamDialog } from '@valguide/core/features/orgs/components/create-team-dialog'
import { createTeamFn } from '@valguide/core/features/orgs/server-functions'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'

export function NoTeamWelcome() {
  const t = useTranslations('orgs.noTeam')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight">{t('welcome')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <CreateTeamDialog onCreateTeam={(name) => createTeamFn({ data: { name } })}>
        <Button size="lg">{t('createButton')}</Button>
      </CreateTeamDialog>
    </div>
  )
}
