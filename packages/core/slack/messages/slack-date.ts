export function formatSlackDate(timestampMs: number): string {
  const timestampSeconds = Math.floor(timestampMs / 1000)
  return `<!date^${timestampSeconds}^{date_short_pretty} at {time}|${new Date(timestampMs).toISOString()}>`
}
