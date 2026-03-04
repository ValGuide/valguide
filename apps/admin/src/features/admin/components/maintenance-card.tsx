import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Calendar } from '@valguide/ui/components/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Field, FieldLabel } from '@valguide/ui/components/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@valguide/ui/components/input-group'
import { Label } from '@valguide/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { Switch } from '@valguide/ui/components/switch'
import { Textarea } from '@valguide/ui/components/textarea'
import { CalendarIcon, Clock2Icon } from 'lucide-react'
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

function parseDatetimeLocalValue(value: string): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toReadableDatetime(value: string): string {
  const date = parseDatetimeLocalValue(value)
  if (!date) return 'Select date'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
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
  const savedMessage = status.message ?? ''
  const savedEta = toDatetimeLocalValue(status.eta)
  const etaDate = useMemo(() => parseDatetimeLocalValue(eta), [eta])
  const etaTime = eta.includes('T') ? eta.split('T')[1] : ''
  const hasUnsavedDetails = message !== savedMessage || eta !== savedEta

  const handleEtaDateChange = (date: Date | undefined) => {
    if (!date) {
      setEta('')
      return
    }

    const time = etaTime || '09:00'
    setEta(`${toDateInputValue(date)}T${time}`)
  }

  const handleEtaTimeChange = (time: string) => {
    if (!etaDate) return
    setEta(`${toDateInputValue(etaDate)}T${time || '00:00'}`)
  }

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
            <Label className="text-sm events-none cursor-default">Maintenance active</Label>
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
          <Label>Estimated end time (optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isPending}
              >
                <CalendarIcon className="mr-2 size-4" />
                {toReadableDatetime(eta)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={etaDate ?? undefined} onSelect={handleEtaDateChange} className="p-0" />
              <div className="border-t p-3">
                <Field>
                  <FieldLabel htmlFor={`${app}-maintenance-eta-time`}>Time</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={`${app}-maintenance-eta-time`}
                      type="time"
                      value={etaTime}
                      onChange={(event) => handleEtaTimeChange(event.target.value)}
                      disabled={isPending || !etaDate}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    <InputGroupAddon align="inline-end">
                      <Clock2Icon className="text-muted-foreground" />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <div className="mt-2 flex justify-end">
                  <Button type="button" variant="ghost" onClick={() => setEta('')} disabled={isPending || !etaDate}>
                    Clear
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() =>
              onSetStatus({
                app,
                enabled: true,
                message: normalizedMessage || undefined,
                eta: normalizedEta || undefined,
              })
            }
            disabled={isPending || !status.enabled || !hasUnsavedDetails}
          >
            Save details
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          {status.enabledAt ? <p>Enabled at: {new Date(status.enabledAt).toLocaleString()}</p> : <p>Enabled at: —</p>}
          {status.enabledBy ? <p>Enabled by: {status.enabledBy}</p> : <p>Enabled by: —</p>}
        </div>
      </CardContent>
    </Card>
  )
}
