'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, Users } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [totalApartments, setTotalApartments] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const user = await getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const role = await getUserRole(user.id)
      if (!['admin', 'administrator'].includes(role)) {
        router.push('/')
        return
      }

      setUserRole(role)
      loadStats()
    }

    checkAuth()
  }, [router])

  async function loadStats() {
    const supabase = createClient()
    const [{ count: apartments }, { count: users }] = await Promise.all([
      supabase.from('apartments').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true })
    ])
    setTotalApartments(apartments || 0)
    setTotalUsers(users || 0)
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>
  }

  const stats = [
    {
      title: 'Total Apartments',
      value: totalApartments,
      icon: Home,
      color: 'text-blue-600'
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-purple-600',
      adminOnly: true
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-title">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 font-bebas">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2 font-mulish">
            Welcome back! Here&apos;s an overview of your Venice Parcley platform.
          </p>
        </div>
        <Badge variant={userRole === 'administrator' ? 'default' : 'secondary'}>
          {userRole === 'administrator' ? 'Administrator' : 'Admin'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats
          .filter(stat => !stat.adminOnly || userRole === 'administrator')
          .map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Link
                href="/admin/content"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span>Manage Content</span>
                </div>
                <span className="text-sm text-gray-500">→</span>
              </Link>

              {userRole === 'administrator' && (
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Manage Users</span>
                  </div>
                  <span className="text-sm text-gray-500">→</span>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display.</p>
              <p className="text-sm mt-1">Activity will appear here as users interact with the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
