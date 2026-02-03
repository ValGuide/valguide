import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@valguide/core/ui/components/dialog'
import { type IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import { Camera, CameraOff } from 'lucide-react'
import { useCallback, useState } from 'react'

type QrScannerModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (url: string) => void
}

type CameraErrorKey = 'cameraPermissionDenied' | 'cameraNotFound' | 'cameraError'

export function QrScannerModal({ open, onOpenChange, onScan }: QrScannerModalProps) {
  const t = useTranslations('player')
  const [error, setError] = useState<CameraErrorKey | null>(null)
  const [paused, setPaused] = useState(false)

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (detectedCodes.length > 0) {
        const code = detectedCodes[0]
        setPaused(true)
        onScan(code.rawValue)
        onOpenChange(false)
        setTimeout(() => setPaused(false), 500)
      }
    },
    [onScan, onOpenChange],
  )

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        setError('cameraPermissionDenied')
      } else if (err.name === 'NotFoundError') {
        setError('cameraNotFound')
      } else {
        setError('cameraError')
      }
    }
  }, [])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setError(null)
        setPaused(false)
      }
      onOpenChange(newOpen)
    },
    [onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>{t('scanQrCode')}</DialogTitle>
          <DialogDescription className="sr-only">{t('scanQrCode')}</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-square w-full bg-muted">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <CameraOff className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t(error)}</p>
              <Button variant="outline" onClick={() => setError(null)}>
                {t('tryAgain')}
              </Button>
            </div>
          ) : (
            <>
              <Scanner
                onScan={handleScan}
                onError={handleError}
                paused={paused}
                constraints={{ facingMode: 'environment' }}
                formats={['qr_code']}
                components={{
                  finder: true,
                }}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { width: '100%', height: '100%', objectFit: 'cover' },
                }}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('pointAtQrCode')}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
