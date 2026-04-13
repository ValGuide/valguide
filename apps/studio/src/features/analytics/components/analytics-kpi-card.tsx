import { Card, CardContent, CardHeader, CardTitle } from '@valguide/core/ui/components/card'

export function AnalyticsKpiCard({ description, title, value }: { description: string; title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
