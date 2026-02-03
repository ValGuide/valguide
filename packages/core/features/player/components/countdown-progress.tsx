type CountdownProgressProps = {
  /** Progress value from 0 to 100 */
  progress: number
  className?: string
}

export function CountdownProgress({ progress, className = '' }: CountdownProgressProps) {
  return (
    <div className={`h-1 w-full bg-background rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
    </div>
  )
}
