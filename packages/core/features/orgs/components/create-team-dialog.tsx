
import { useRouter } from '@tanstack/react-router'
import { Button } from '@valguide/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@valguide/ui/components/dialog'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { PlusCircle } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import * as React from 'react'
import { toast } from 'sonner'

export interface CreateTeamDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
  onCreateTeam: (name: string, slug?: string) => Promise<unknown>
}

export function CreateTeamDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
  onCreateTeam,
}: CreateTeamDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const t = useTranslations('orgs.createTeam')
  const _router = useRouter()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setName('')
      setSlug('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) return

    setIsSubmitting(true)
    try {
      await onCreateTeam(name, slug || undefined)
      toast.success(t('success'))
      // Hard redirect to reload the app/sidebar with the new team
      window.location.href = '/'
      handleOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error(t('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && children && <DialogTrigger asChild>{children}</DialogTrigger>}
      {showTrigger && !children && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 size-4" />
            {t('triggerButton')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">{t('slugLabel')}</Label>
              <Input
                id="slug"
                placeholder={t('slugPlaceholder')}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">{t('slugDescription')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
