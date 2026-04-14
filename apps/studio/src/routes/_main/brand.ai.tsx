import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/brand/ai')({
  beforeLoad: () => {
    throw redirect({
      to: '/brand/theme',
      search: { assistant: 'ai' },
    })
  },
})
