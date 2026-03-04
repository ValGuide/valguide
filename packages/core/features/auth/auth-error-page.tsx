import { Link } from '@tanstack/react-router'
import { Button } from '@valguide/core/ui/components/button'

export const authErrorCodeToI18nKey: Record<string, string> = {
  oAuth_code_missing: 'oAuthCodeMissing',
  please_restart_the_process: 'sessionExpired',
  social_account_not_found: 'accountNotFound',
  unable_to_create_user: 'accountCreationFailed',
  origin_check_failed: 'originNotTrusted',
}

export type AuthErrorPageProps = {
  i18n: {
    title: string
    description: string
    backToLogin: string
  }
  errorCode?: string
  loginPath?: string
}

export function AuthErrorPage({ i18n, errorCode, loginPath = '/login' }: AuthErrorPageProps) {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            aria-hidden="true"
            className="size-8 text-destructive"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl">{i18n.title}</h1>
          <p className="text-sm text-muted-foreground">{i18n.description}</p>
        </div>

        {errorCode && (
          <p className="rounded bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">{errorCode}</p>
        )}

        <Link to={loginPath}>
          <Button>{i18n.backToLogin}</Button>
        </Link>
      </div>
    </div>
  )
}
