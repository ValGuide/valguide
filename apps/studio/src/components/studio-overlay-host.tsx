import { Toaster } from '@valguide/ui/components/sonner'
import { AssetUploadSessionOverlays } from '@/features/assets/upload-session/asset-upload-session'

export function StudioOverlayHost() {
  return (
    <div data-persistent-overlay-host className="pointer-events-none">
      <Toaster />
      <AssetUploadSessionOverlays />
    </div>
  )
}
