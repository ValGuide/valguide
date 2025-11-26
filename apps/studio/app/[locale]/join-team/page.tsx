import { createHash } from 'crypto'
import { createClient } from '@valguide/core/supabase/server'
import { joinTeamAction } from '@valguide/core/features/orgs/actions'
import { getInvitationByTokenHash } from '@valguide/core/features/orgs/queries'
import { db } from '@valguide/core/features/db'
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

  if (!token) {
    redirect(`/${locale}`)
  }

  // 1. Fetch invitation details (publicly available via token)
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const invite = await getInvitationByTokenHash(db, tokenHash)

  // Handle invalid/expired invitation
  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invitation Invalid</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has been canceled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please ask the team admin to send you a new invitation.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 2. Check authentication
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const nextUrl = `/${locale}/join-team?token=${token}`

  // 3. Case: User is NOT logged in -> Public Landing Page
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join {invite.organization.name}</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join <strong>{invite.organization.name}</strong> on ValGuide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm">
              <p className="font-medium">Invitation for:</p>
              <p className="text-muted-foreground">{invite.email}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              To accept this invitation, please sign in or create an account with this email address.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link
                href={`/signup?email=${encodeURIComponent(invite.email)}&next=${encodeURIComponent(nextUrl)}`}
              >
                Create Account
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/login?next=${encodeURIComponent(nextUrl)}`}>
                I already have an account
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 4. Case: User IS logged in but EMAIL MISMATCH
  const userEmail = user.email || ''
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Wrong Account</CardTitle>
            <CardDescription>
              You are currently signed in as <strong>{userEmail}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <p>
                This invitation is intended for <strong>{invite.email}</strong>.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please sign out and sign in with the correct account to accept this invitation.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {/* Use /logout route if it exists, otherwise manual signout flow */}
            <form action="/signout" method="post" className="w-full">
              <Button type="submit" variant="outline" className="w-full">
                Sign Out & Switch Account
              </Button>
            </form>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 5. Case: User logged in & Email matches -> Attempt to Join
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
          <CardTitle>Joining Team...</CardTitle>
          <CardDescription>
            Accepting invitation for {invite.organization.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
              <p className="text-sm text-muted-foreground">
                There was a problem joining the team.
              </p>
            </div>
          ) : (
            <div className="flex justify-center p-4">
              {/* Simple loading indicator */}
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          {error && (
            <Button asChild className="w-full">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
