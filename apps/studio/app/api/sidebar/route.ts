import { createServerFn } from '@tanstack/react-start'
import { getSidebarData } from '@valguide/core/features/orgs/sidebar-data'

export const getSidebarDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  const data = await getSidebarData()

  if (!data) {
    throw new Error('Unauthorized')
  }

  return data
})
