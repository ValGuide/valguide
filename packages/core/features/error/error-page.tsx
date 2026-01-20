import { HomeButton } from '../404/home-button'

export type ErrorPageProps = {
  i18n: {
    title: string
    description: string
    tryAgain?: string
  }
  error?: Error
  reset?: () => void
}

export const ErrorPage = ({ i18n, error, reset }: ErrorPageProps) => {
  return (
    <div className="min-h-svh flex flex-col flex-1 items-center justify-center px-8">
      <div className="flex items-center justify-center size-20 rounded-full bg-destructive/10 mb-6">
        <svg
          aria-hidden="true"
          className="size-10 text-destructive"
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
      <h1 className="text-4xl sm:text-5xl font-bold text-center">{i18n.title}</h1>
      <p className="py-6 max-w-md text-center text-muted-foreground">{i18n.description}</p>
      {error?.message && process.env.NODE_ENV === 'development' && (
        <pre className="mb-6 p-4 bg-muted rounded-lg text-sm max-w-lg overflow-auto text-destructive">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3">
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {i18n.tryAgain ?? 'Try again'}
          </button>
        )}
        <HomeButton />
      </div>
    </div>
  )
}
