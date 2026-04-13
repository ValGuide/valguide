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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <Recharts.BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <Recharts.CartesianGrid vertical={false} />
            <Recharts.XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Recharts.Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </Recharts.BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
