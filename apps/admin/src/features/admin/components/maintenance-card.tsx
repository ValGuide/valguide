import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Switch } from '@valguide/ui/components/switch'
import { Textarea } from '@valguide/ui/components/textarea'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { AdminMaintenanceStatus } from '@/server/functions/get-maintenance-status.fn'
import type { SetMaintenanceStatusInput } from '@/server/functions/set-maintenance-status.fn'

type MaintenanceCardProps = {
  app: 'studio' | 'app'
  status: AdminMaintenanceStatus['studio'] | AdminMaintenanceStatus['app']
  isPending: boolean
  onSetStatus: (input: SetMaintenanceStatusInput) => void
}

function appLabel(app: 'studio' | 'app'): string {
  return app === 'studio' ? 'Studio' : 'App'
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const offsetMinutes = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offsetMinutes * 60_000)
  return local.toISOString().slice(0, 16)
}

export function MaintenanceCard({ app, status, isPending, onSetStatus }: MaintenanceCardProps) {
  const [message, setMessage] = useState(status.message ?? '')
  const [eta, setEta] = useState(toDatetimeLocalValue(status.eta))

  useEffect(() => {
    setMessage(status.message ?? '')
    setEta(toDatetimeLocalValue(status.eta))
  }, [status.message, status.eta])

  const statusLabel = status.enabled ? 'Enabled' : 'Disabled'
  const normalizedMessage = message.trim()
  const normalizedEta = eta.trim()
  const canEnable = useMemo(() => !isPending, [isPending])

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{appLabel(app)} Maintenance</CardTitle>
          <Badge variant={status.enabled ? 'default' : 'outline'}>{statusLabel}</Badge>
        </div>
        <CardDescription>
          Toggle maintenance mode for the {appLabel(app).toLowerCase()} runtime. This blocks page loads and server
          requests with HTTP 503.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-w-0">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="space-y-0.5">
            <Label htmlFor={`${app}-maintenance-toggle`} className="text-sm events-none cursor-default">
              Maintenance active
            </Label>
            <p className="text-xs text-muted-foreground">
              {status.enabled ? 'Requests are currently blocked' : 'Runtime is serving normally'}
            </p>
          </div>
          <Switch
            id={`${app}-maintenance-toggle`}
            checked={status.enabled}
            disabled={isPending}
            onCheckedChange={(enabled) =>
              onSetStatus({
                app,
                enabled,
                message: enabled ? normalizedMessage : undefined,
                eta: enabled ? normalizedEta : undefined,
              })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${app}-maintenance-message`}>Message (optional)</Label>
          <Textarea
            id={`${app}-maintenance-message`}
            placeholder="Short notice shown on maintenance page"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isPending}
            maxLength={500}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${app}-maintenance-eta`}>Estimated end time (optional)</Label>
          <Input
            id={`${app}-maintenance-eta`}
            type="datetime-local"
            value={eta}
            onChange={(event) => setEta(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          {status.enabledAt ? <p>Enabled at: {new Date(status.enabledAt).toLocaleString()}</p> : <p>Enabled at: —</p>}
          {status.enabledBy ? <p>Enabled by: {status.enabledBy}</p> : <p>Enabled by: —</p>}
        </div>
      </CardContent>
    </Card>
  )
}
