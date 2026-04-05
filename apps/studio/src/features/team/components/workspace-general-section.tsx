import { useQueryClient } from '@tanstack/react-query'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { TeamData } from '@valguide/core/features/orgs/get-team-data.fn'
import { updateOrgLogoFn } from '@valguide/core/features/orgs/update-org-logo.fn'
import { updateOrgNameFn } from '@valguide/core/features/orgs/update-org-name.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { valguideId } from '@valguide/core/utils/nanoid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { uploadFile } from '@/features/assets/lib/upload'
import { OrgAvatarForm } from './org-avatar-form'
import { OrgNameForm } from './org-name-form'

interface WorkspaceGeneralSectionProps {
  data: TeamData
  onRefetch: () => Promise<void>
}

export function WorkspaceGeneralSection({ data, onRefetch }: WorkspaceGeneralSectionProps) {
  const t = useTranslations('orgs.teamSettings')
  const queryClient = useQueryClient()

  const invalidateAfterOrgUpdate = async () => {
    await onRefetch()
    await queryClient.invalidateQueries({ queryKey: ['sidebar'] })
  }

  const handleUpdateName = async (organizationId: string, newName: string) => {
    await updateOrgNameFn({ data: { organizationId, newName } })
    await invalidateAfterOrgUpdate()
  }

  const handleUploadAndSaveLogo = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const fileId = valguideId()
    const storagePath = `orgs/${data.team.nanoId}/logos/${fileId}.${ext}`

    await uploadFile({
      key: storagePath,
      file,
    })

    await updateOrgLogoFn({
      data: { organizationId: data.team.id, storagePath },
    })

    await invalidateAfterOrgUpdate()
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
            currentLogo={
              data.team.logoStoragePath ? getAssetImageUrl({ storagePath: data.team.logoStoragePath }) : null
            }
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
