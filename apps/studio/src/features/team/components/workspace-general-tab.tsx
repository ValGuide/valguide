import type { TeamData } from '@valguide/core/features/orgs/get-team-data.fn'
import { updateOrgLogoFn } from '@valguide/core/features/orgs/update-org-logo.fn'
import { updateOrgNameFn } from '@valguide/core/features/orgs/update-org-name.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { uploadFileWithTUS } from '@/features/assets/lib/tus-upload'
import { OrgAvatarForm } from './org-avatar-form'
import { OrgNameForm } from './org-name-form'

interface WorkspaceGeneralTabProps {
  data: TeamData
  onRefetch: () => Promise<void>
}

export function WorkspaceGeneralTab({ data, onRefetch }: WorkspaceGeneralTabProps) {
  const t = useTranslations('orgs.teamSettings')

  const handleUpdateName = async (organizationId: string, newName: string) => {
    await updateOrgNameFn({ data: { organizationId, newName } })
    await onRefetch()
  }

  const handleUploadAndSaveLogo = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const storagePath = `org-logos/${data.team.id}/${crypto.randomUUID()}.${ext}`

    await uploadFileWithTUS({
      bucketName: 'assets',
      fileName: storagePath,
      file,
    })

    await updateOrgLogoFn({
      data: { organizationId: data.team.id, storagePath },
    })

    await onRefetch()
  }

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('profileSectionTitle')}</CardTitle>
          <CardDescription>{t('profileSectionDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrgAvatarForm
            currentLogo={data.team.logo}
            orgName={data.team.name}
            onUploadAndSave={handleUploadAndSaveLogo}
          />
          <div className="border-t pt-4">
            <OrgNameForm organizationId={data.team.id} currentName={data.team.name} onUpdateName={handleUpdateName} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
