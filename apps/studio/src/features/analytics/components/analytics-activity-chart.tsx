import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/core/ui/components/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Recharts,
} from '@valguide/core/ui/components/chart'
import type { GuideAnalyticsSummary } from '../get-guide-analytics.server'

export function AnalyticsActivityChart({
  data,
  description,
  labels,
  title,
}: {
  data: GuideAnalyticsSummary['recentActivity']
  description: string
  labels: {
    tourOpens: string
    stopOpens: string
    audioPlays: string
  }
  title: string
}) {
  const chartConfig = {
    tourOpens: {
      label: labels.tourOpens,
      color: 'var(--chart-1)',
    },
    stopOpens: {
      label: labels.stopOpens,
      color: 'var(--chart-2)',
    },
    audioPlays: {
      label: labels.audioPlays,
      color: 'var(--chart-3)',
    },
  } satisfies ChartConfig

  return (
    <Card className="min-w-0 overflow-hidden rounded-3xl border-border/80 shadow-none">
      <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-1 pb-3 sm:px-6 sm:pb-6">
        <ChartContainer config={chartConfig} className="h-[220px] w-full sm:h-[320px]">
          <Recharts.AreaChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <Recharts.CartesianGrid vertical={false} />
            <Recharts.XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Recharts.Area
              dataKey="tourOpens"
              type="monotone"
              fill="var(--color-tourOpens)"
              fillOpacity={0.15}
              stroke="var(--color-tourOpens)"
              strokeWidth={2}
            />
            <Recharts.Area
              dataKey="stopOpens"
              type="monotone"
              fill="var(--color-stopOpens)"
              fillOpacity={0.15}
              stroke="var(--color-stopOpens)"
              strokeWidth={2}
            />
            <Recharts.Area
              dataKey="audioPlays"
              type="monotone"
              fill="var(--color-audioPlays)"
              fillOpacity={0.15}
              stroke="var(--color-audioPlays)"
              strokeWidth={2}
            />
          </Recharts.AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
