'use server'

import { redirect } from 'next/navigation'
import { createServerAuthClient } from '@/lib/supabase-server'

export async function adminSignIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerAuthClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/admin-login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    // Check if user has admin role after successful login
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const userRole = profile?.role

    if (userRole === 'admin' || userRole === 'administrator') {
      // User is admin, redirect to admin dashboard
      redirect('/admin')
    } else {
      // User authenticated but not admin, redirect to home
      redirect('/')
    }
  }

  // Fallback - shouldn't reach here
  redirect('/')
}