'use client'

import type { ComponentType, AnchorHTMLAttributes, ReactNode } from 'react'
import { forwardRef, createElement } from 'react'
import NextLink from 'next/link'

type RoutingConfig = {
	locales: readonly string[]
	defaultLocale: string
}

export function defineRouting<T extends RoutingConfig>(config: T): T {
	return config
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
	href: string
	locale?: string
	children?: ReactNode
	prefetch?: boolean
}

const MockLink = forwardRef<HTMLAnchorElement, LinkProps>(function MockLink(
	{ href, locale, children, ...props },
	ref
) {
	return createElement(NextLink, { href, ref, ...props }, children)
})

export function createNavigation(_routing: RoutingConfig) {
	return {
		Link: MockLink as ComponentType<LinkProps>,
		redirect: (path: string, _type?: 'push' | 'replace') => {
			throw new Error(`Redirect to ${path} - mock implementation`)
		},
		usePathname: () => '/',
		useRouter: () => ({
			push: (_path: string) => {},
			replace: (_path: string) => {},
			prefetch: (_path: string) => {},
			back: () => {},
			forward: () => {},
		}),
		getPathname: (params: { locale: string; href: string }) => params.href,
	}
}
