import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { TeamData } from '@valguide/core/features/orgs/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { OrgAvatarForm } from './org-avatar-form'
import { OrgNameForm } from './org-name-form'

interface WorkspaceGeneralSectionProps {
  data: TeamData
  onUpdateName: (organizationId: string, newName: string) => Promise<void>
  onUploadAndSaveLogo: (file: File) => Promise<void>
}

export function WorkspaceGeneralSection({ data, onUpdateName, onUploadAndSaveLogo }: WorkspaceGeneralSectionProps) {
  const t = useTranslations('orgs.teamSettings')

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('profileSectionTitle')}</CardTitle>
          <CardDescription>{t('profileSectionDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrgAvatarForm
            currentLogo={
              data.team.logoStoragePath ? getAssetImageUrl({ storagePath: data.team.logoStoragePath }) : null
            }
            orgName={data.team.name}
            onUploadAndSave={onUploadAndSaveLogo}
          />
          <div className="border-t pt-4">
            <OrgNameForm organizationId={data.team.id} currentName={data.team.name} onUpdateName={onUpdateName} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
