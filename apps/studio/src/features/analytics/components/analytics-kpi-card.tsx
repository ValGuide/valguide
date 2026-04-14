import { Card, CardContent, CardHeader, CardTitle } from '@valguide/core/ui/components/card'

export function AnalyticsKpiCard({ description, title, value }: { description: string; title: string; value: string }) {
  return (
    <Card className="h-full rounded-3xl border-border/80 shadow-none">
      <CardHeader className="space-y-0 px-4 pt-4 pb-0 sm:px-6 sm:pt-6">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pt-3 pb-4 sm:px-6 sm:gap-4 sm:pb-6">
        <div className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{value}</div>
        <p className="max-w-[24ch] text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
