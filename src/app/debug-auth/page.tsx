'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getUser, getUserRole } from '@/lib/auth'

export default function DebugAuthPage() {
  const [userData, setUserData] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuthData() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setSessionData(session)

      const user = await getUser()
      setUserData(user)

      if (user) {
        const role = await getUserRole(user.id)
        setUserRole(role)

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfileData(profile)
      }

      setLoading(false)
    }

    loadAuthData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading auth data...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

      <div className="space-y-6">
        <div className="border p-4 rounded-lg">
          <h2 className="font-semibold mb-2">User Session</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="font-semibold mb-2">User Role</h2>
          <p>Calculated role: <strong>{userRole}</strong></p>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Profile Data</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Session Data</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
