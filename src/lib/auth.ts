import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type UserRole = 'guest' | 'member' | 'user' | 'admin' | 'administrator'

export async function getUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = createClient()

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !profile || !profile.role) {
      return 'guest'
    }

    return profile.role as UserRole
  } catch {
    return 'guest'
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error('Failed to fetch user profile')
  }

  return profile
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      role: role,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    throw new Error('Failed to update user role')
  }
}

export async function createUserProfile(userId: string, fullName: string, role: UserRole = 'guest') {
  try {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    const email = userData?.user?.email || ''

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role
      })

    if (error && !error.message?.includes('duplicate')) {
      console.error('Failed to create user profile:', error)
    }
  } catch (catchError) {
    console.error('Exception during profile creation:', catchError)
  }
}

export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[] | UserRole): boolean {
  const roleArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roleArray.includes(userRole)
}
