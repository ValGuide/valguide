import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Progress } from '@valguide/ui/components/progress'
import { Switch } from '@valguide/ui/components/switch'
import { cn } from '@valguide/ui/lib/utils'
import { Heart, MapPin, Play, Share2, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import type { CSSProperties } from 'react'

export interface PlayerPreviewProps {
  style?: CSSProperties
  className?: string
}

export function PlayerPreview({ style, className }: PlayerPreviewProps) {
  const t = useTranslations('studio.themeCustomizer')
  const shellStyle = { ...style, borderRadius: 'calc(var(--radius) + 0.375rem)' } satisfies CSSProperties
  const sectionRadiusStyle = { borderRadius: 'var(--radius)' } satisfies CSSProperties
  const pillRadiusStyle = { borderRadius: 'calc(var(--radius) * 2)' } satisfies CSSProperties
  const controlRadiusStyle = { borderRadius: 'calc(var(--radius) + 0.125rem)' } satisfies CSSProperties
  const imageCardRadiusStyle = { borderRadius: 'calc(var(--radius) + 0.25rem)' } satisfies CSSProperties

  return (
    <div className={cn('bg-background text-foreground overflow-hidden border', className)} style={shellStyle}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-card p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-10 bg-primary flex items-center justify-center" style={imageCardRadiusStyle}>
                <MapPin className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-card-foreground">{t('playerPreview.tourTitle')}</h2>
                <p className="text-xs text-muted-foreground">{t('playerPreview.tourInfo')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="size-8">
                <Heart className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="relative aspect-square bg-muted flex-shrink-0 overflow-hidden">
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative element */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="400" height="400" className="fill-muted" />
            <circle cx="200" cy="160" r="60" className="fill-primary/20" />
            <rect x="100" y="220" width="200" height="120" rx="20" className="fill-card" />
            <rect x="120" y="240" width="160" height="16" rx="8" className="fill-primary/30" />
            <rect x="120" y="270" width="120" height="12" rx="6" className="fill-muted-foreground/20" />
            <rect x="120" y="295" width="80" height="12" rx="6" className="fill-muted-foreground/20" />
          </svg>
          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm" style={pillRadiusStyle}>
              {t('playerPreview.stopBadge')}
            </Badge>
          </div>
        </div>

        {/* Player Controls */}
        <div className="bg-card p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-card-foreground">{t('playerPreview.stopTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('playerPreview.stopDescription')}</p>
          </div>

          <div className="space-y-2">
            <Progress value={35} className="h-1.5" style={pillRadiusStyle} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1:24</span>
              <span>4:02</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" className="size-10" style={controlRadiusStyle}>
              <SkipBack className="size-5" />
            </Button>
            <Button size="icon" className="size-12" style={pillRadiusStyle}>
              <Play className="size-6" />
            </Button>
            <Button variant="ghost" size="icon" className="size-10" style={controlRadiusStyle}>
              <SkipForward className="size-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="size-4 text-muted-foreground" />
            <Progress value={70} className="h-1 flex-1" style={pillRadiusStyle} />
          </div>
        </div>

        {/* Sample Form Elements */}
        <div className="bg-background p-4 space-y-4 border-t">
          <h4 className="text-sm font-medium">{t('formElementsPreview')}</h4>

          <div className="space-y-2 rounded-[inherit]" style={sectionRadiusStyle}>
            <Label htmlFor="preview-input">{t('inputField')}</Label>
            <Input id="preview-input" placeholder="..." style={controlRadiusStyle} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="preview-switch">{t('toggleSwitch')}</Label>
            <Switch id="preview-switch" defaultChecked style={pillRadiusStyle} />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="default" size="sm" style={controlRadiusStyle}>
              {t('primary')}
            </Button>
            <Button variant="secondary" size="sm" style={controlRadiusStyle}>
              {t('secondary')}
            </Button>
            <Button variant="outline" size="sm" style={controlRadiusStyle}>
              {t('outline')}
            </Button>
            <Button variant="destructive" size="sm" style={controlRadiusStyle}>
              {t('destructive')}
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge style={pillRadiusStyle}>{t('primary')}</Badge>
            <Badge variant="secondary" style={pillRadiusStyle}>
              {t('secondary')}
            </Badge>
            <Badge variant="outline" style={pillRadiusStyle}>
              {t('outline')}
            </Badge>
            <Badge variant="destructive" style={pillRadiusStyle}>
              {t('destructive')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
