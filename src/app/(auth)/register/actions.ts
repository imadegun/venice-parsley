'use server'

import { createUserProfile as createProfile } from '@/lib/auth'

export async function createUserProfile(userId: string, fullName: string) {
  // Profile creation is now non-blocking - errors are logged but not thrown
  await createProfile(userId, fullName, 'guest')
}