import { createFileRoute } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'

export const Route = createFileRoute('/_main/tours')({
  component: ToursPage,
})

function ToursPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Tours</h1>
        <p className="text-muted-foreground mt-2">Coming soon</p>
      </div>
    </div>
  )
}
