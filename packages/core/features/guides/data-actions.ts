'use server'

import { createClient } from '../../supabase/server'
import { db } from '../db'
import { getArchivedGuides } from '../guides/queries'

export async function getArchivedGuidesAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const guides = await getArchivedGuides(db, user.id)
  
  return {
    guides,
    userId: user.id
  }
}
