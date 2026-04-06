import { useQueryClient } from '@tanstack/react-query'
import type { TeamData } from '@valguide/core/features/orgs/types'
import { updateOrgLogoFn } from '@valguide/core/features/orgs/update-org-logo.fn'
import { updateOrgNameFn } from '@valguide/core/features/orgs/update-org-name.fn'
import { valguideId } from '@valguide/core/utils/nanoid'
import { uploadFile } from '@/features/assets/lib/upload'
import { WorkspaceGeneralSection } from './workspace-general-section'

interface WorkspaceGeneralSectionConnectedProps {
  data: TeamData
  onRefetch: () => Promise<void>
}

export function WorkspaceGeneralSectionConnected({ data, onRefetch }: WorkspaceGeneralSectionConnectedProps) {
  const queryClient = useQueryClient()

  const invalidateAfterOrgUpdate = async () => {
    await onRefetch()
    await queryClient.invalidateQueries({ queryKey: ['sidebar'] })
  }

  return (
    <WorkspaceGeneralSection
      data={data}
      onUpdateName={async (organizationId, newName) => {
        await updateOrgNameFn({ data: { organizationId, newName } })
        await invalidateAfterOrgUpdate()
      }}
      onUploadAndSaveLogo={async (file) => {
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
      }}
    />
  )
}
