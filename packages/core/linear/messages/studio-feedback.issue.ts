type Props = {
  feedback: string
  userEmail: string
  userName?: string
  teamName?: string
  teamNanoId?: string
  pageUrl?: string
  screenshotUrl?: string
  feedbackId: string
}

export function studioFeedbackIssue(props: Props) {
  const title = buildTitle(props)
  const description = buildDescription(props)
  return { title, description }
}

function buildTitle({ feedback, userName, userEmail }: Props): string {
  const firstLine = feedback.split('\n')[0]?.trim()
  if (firstLine && firstLine.length <= 100) return firstLine
  if (firstLine) return `${firstLine.slice(0, 97)}...`
  return `Studio Feedback from ${userName ?? userEmail}`
}

function buildDescription(props: Props): string {
  const lines: string[] = []

  lines.push(props.feedback)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push(`**From:** ${props.userName ?? props.userEmail}`)
  lines.push(`**Email:** ${props.userEmail}`)

  if (props.teamName) {
    lines.push(`**Team:** ${props.teamName}${props.teamNanoId ? ` (${props.teamNanoId})` : ''}`)
  }

  if (props.pageUrl) {
    lines.push(`**Page:** ${props.pageUrl}`)
  }

  if (props.screenshotUrl) {
    lines.push('')
    lines.push(`![Screenshot](${props.screenshotUrl})`)
  }

  lines.push('')
  lines.push(`**Feedback ID:** ${props.feedbackId}`)

  return lines.join('\n')
}
