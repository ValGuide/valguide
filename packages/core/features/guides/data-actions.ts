'use server'

import { createClient } from '../../supabase/server'
import { db } from '../db'
import { getArchivedGuides } from '../guides/queries'

export async function getArchivedGuidesAction() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    return null
  }

  const guides = await getArchivedGuides(db, user.sub)

  return {
    guides,
    userId: user.sub,
  }
}
