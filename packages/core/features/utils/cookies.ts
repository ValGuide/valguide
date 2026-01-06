import {getCookie, setCookie} from '@tanstack/react-start/server'

export function getActiveTeamSlug(): string | undefined {
    return getCookie('active-team-slug')
}

export function setActiveTeamSlug(slug: string): void {
    setCookie('active-team-slug', slug, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    })
}
