import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

export function TanStackAppDevtools() {
  return (
    <TanStackDevtools
      config={{
        position: 'bottom-right',
        hideUntilHover: true,
      }}
      plugins={[
        {
          name: 'React Query',
          render: <ReactQueryDevtoolsPanel />,
          defaultOpen: false,
        },
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
          defaultOpen: false,
        },
      ]}
    />
  )
}
