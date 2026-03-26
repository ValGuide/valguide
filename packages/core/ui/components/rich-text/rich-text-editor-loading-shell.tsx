export interface RichTextEditorLoadingShellProps {
  readOnly?: boolean
}

export function RichTextEditorLoadingShell({ readOnly }: RichTextEditorLoadingShellProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="overflow-hidden rounded-md border bg-card text-card-foreground">
        <div className={`flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2 ${readOnly ? 'opacity-50' : ''}`}>
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
          <div className="mx-1 h-6 w-px bg-border" />
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
          <div className="mx-1 h-6 w-px bg-border" />
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
          <div className="mx-1 h-6 w-px bg-border" />
          <ToolbarSkeleton className="w-8" />
          <div className="mx-1 h-6 w-px bg-border" />
          <ToolbarSkeleton className="w-8" />
          <ToolbarSkeleton className="w-8" />
        </div>
        <div className="min-h-[120px] rounded-b-md border-x border-b bg-card p-4">
          <div className="space-y-2" aria-hidden="true">
            <div className="h-4 w-11/12 rounded-sm bg-muted" />
            <div className="h-4 w-4/5 rounded-sm bg-muted" />
            <div className="h-4 w-2/3 rounded-sm bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarSkeleton({ className }: { className?: string }) {
  return <div className={`h-8 rounded-sm bg-muted ${className ?? ''}`} aria-hidden="true" />
}
