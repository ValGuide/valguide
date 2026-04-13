import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/core/ui/components/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/core/ui/components/table'
import type { GuideAnalyticsSummary } from '../get-guide-analytics.server'

function formatLastActivity(value: string | null, emptyLabel: string): string {
  if (!value) {
    return emptyLabel
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AnalyticsTourTable({
  data,
  description,
  labels,
  title,
}: {
  data: GuideAnalyticsSummary['tours']
  description: string
  labels: {
    tour: string
    visitors: string
    tourOpens: string
    stopOpens: string
    audioPlays: string
    lastActivity: string
    noActivity: string
  }
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labels.tour}</TableHead>
              <TableHead className="text-right">{labels.visitors}</TableHead>
              <TableHead className="text-right">{labels.tourOpens}</TableHead>
              <TableHead className="text-right">{labels.stopOpens}</TableHead>
              <TableHead className="text-right">{labels.audioPlays}</TableHead>
              <TableHead>{labels.lastActivity}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((tour) => (
              <TableRow key={tour.nanoId}>
                <TableCell className="max-w-[240px] truncate font-medium">{tour.title}</TableCell>
                <TableCell className="text-right">{tour.uniqueVisitors.toLocaleString()}</TableCell>
                <TableCell className="text-right">{tour.tourOpens.toLocaleString()}</TableCell>
                <TableCell className="text-right">{tour.stopOpens.toLocaleString()}</TableCell>
                <TableCell className="text-right">{tour.audioPlays.toLocaleString()}</TableCell>
                <TableCell>{formatLastActivity(tour.lastActivityAt, labels.noActivity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
