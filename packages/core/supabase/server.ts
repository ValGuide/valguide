import {createServerClient} from '@supabase/ssr'
import {cookieOptions} from '@valguide/supabase/cookies'
import {getCookies, setCookie} from '@tanstack/react-start/server'


export async function createClient() {
    return createServerClient(process.env.VG_SUPABASE_URL!, process.env.VG_SUPABASE_PUBLISHABLE_KEY!, {

        cookies: {
            getAll() {
                return Object.entries(getCookies()).map(([name, value]) => ({
                    name,
                    value,
                }))
            },
            setAll(cookies) {
                cookies.forEach((cookie) => {
                    setCookie(cookie.name, cookie.value)
                })
            },
        },
        cookieOptions,
    })
}
