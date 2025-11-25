import { createClient } from '@valguide/core/supabase/server'
import { joinTeamAction } from '@valguide/core/features/orgs/actions'
import { redirect } from 'next/navigation'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Link } from '@valguide/i18n/routing'

export default async function JoinTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token: string }>
}) {
  const { locale } = await params
  const { token } = await searchParams
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!token) {
    redirect(`/${locale}`)
  }

  if (!user) {
    // Redirect to login with next param
    // We need to use the full path including locale because the login page is localized
    const nextUrl = `/${locale}/join-team?token=${token}`
    redirect(`/${locale}/login?next=${encodeURIComponent(nextUrl)}`)
  }

  let error: string | null = null

  try {
    const result = await joinTeamAction(token)
    if (result.success) {
      redirect(`/${locale}`)
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to join team'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Team</CardTitle>
          <CardDescription>
            You've been invited to join a team on ValGuide.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
              <p className="text-sm text-muted-foreground">
                The invitation link may be invalid or expired. Please ask the team admin to send you a new invitation.
              </p>
            </div>
          ) : (
            <p>Joining team...</p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
