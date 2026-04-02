import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/design')({
  validateSearch: (search: Record<string, unknown>) => ({
    section: search.section === 'qr' ? 'qr' : 'theme',
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: search.section === 'qr' ? '/brand/qr' : '/brand/theme',
    })
  },
})
