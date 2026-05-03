import { redirect } from 'next/navigation'
import { createServerAuthClient } from '@/lib/supabase-server'
import AdminLoginForm from './AdminLoginForm'
import { adminSignIn } from './actions'

export default async function AdminLoginPage() {
  // Check if user is already authenticated
  const supabase = await createServerAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, let the admin layout handle role checking
  // Don't redirect here to avoid redirect loops
  // The adminSignIn action will handle role-based redirects after login

  return <AdminLoginForm signInAction={adminSignIn} />
}