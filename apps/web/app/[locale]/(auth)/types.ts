import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server.js'
import type { Session } from '@auth/core/types'

export type NextAuthRequest = {
  auth: Session | null
} & NextRequest

export type NextAuthMiddleware = (request: NextAuthRequest, event: NextFetchEvent) => ReturnType<NextMiddleware>
