import { serverEnv } from '../env/server'

type CreateLinearIssueInput = {
  title: string
  description: string
  teamId: string
  labelIds?: string[]
}

type CreateLinearIssueResult = {
  id: string
  identifier: string // e.g., "VAL-123"
  url: string
}

export async function createLinearIssue(input: CreateLinearIssueInput): Promise<CreateLinearIssueResult | null> {
  if (!serverEnv.LINEAR_API_KEY) {
    console.warn('[Linear] LINEAR_API_KEY is not set. Skipping Linear issue creation.')
    return null
  }

  const mutation = `
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          url
        }
      }
    }
  `

  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: serverEnv.LINEAR_API_KEY,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input },
    }),
  })

  if (!response.ok) {
    throw new Error(`Linear API request failed with status ${response.status}`)
  }

  const result = await response.json()
  if (result.errors) {
    throw new Error(`Linear API error: ${result.errors[0]?.message ?? 'unknown'}`)
  }

  const issue = result.data?.issueCreate?.issue
  return issue ? { id: issue.id, identifier: issue.identifier, url: issue.url } : null
}
