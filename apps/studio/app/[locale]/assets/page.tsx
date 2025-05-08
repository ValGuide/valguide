import { UppyExample } from '@valguide/features/assets/file-upload/uppy-example'
import { getUploadUrlAction } from '@valguide/features/assets/actions'

export default function AssetsPage() {
  return (
    <div className="flex flex-1 items-center">
      <UppyExample getUploadUrlAction={getUploadUrlAction} />
    </div>
  )
}
