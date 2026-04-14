import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/core/ui/components/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Recharts,
} from '@valguide/core/ui/components/chart'
import type { GuideAnalyticsSummary } from '../get-guide-analytics.server'

export function AnalyticsEventMixChart({
  data,
  description,
  labels,
  title,
}: {
  data: GuideAnalyticsSummary['eventMix']
  description: string
  labels: {
    tourOpens: string
    stopOpens: string
    audioPlays: string
    events: string
  }
  title: string
}) {
  const eventTypeLabels: Record<GuideAnalyticsSummary['eventMix'][number]['eventType'], string> = {
    tour_opened: labels.tourOpens,
    stop_opened: labels.stopOpens,
    audio_played: labels.audioPlays,
  }

  const chartConfig = {
    count: {
      label: labels.events,
      color: 'var(--chart-4)',
    },
  } satisfies ChartConfig

  const chartData = data.map((entry) => ({
    ...entry,
    label: eventTypeLabels[entry.eventType],
  }))

  return (
    <Card className="min-w-0 overflow-hidden rounded-3xl border-border/80 shadow-none">
      <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-1 pb-3 sm:px-6 sm:pb-6">
        <ChartContainer config={chartConfig} className="h-[220px] w-full sm:h-[320px]">
          <Recharts.BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <Recharts.CartesianGrid vertical={false} />
            <Recharts.XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Recharts.Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </Recharts.BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
