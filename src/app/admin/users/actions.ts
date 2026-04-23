'use server'

import { createServerSupabaseClient } from '@/lib/supabase'

export async function updateUserRoleAction(userId: string, newRole: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole as 'guest' | 'member' | 'admin' })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
  }
}
