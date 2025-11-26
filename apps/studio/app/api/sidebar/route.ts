import { getSidebarData } from '@valguide/core/features/orgs/sidebar-data'
import { NextResponse } from 'next/server'

export async function GET() {
  const data = await getSidebarData()

  if (!data) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return NextResponse.json(data)
}
