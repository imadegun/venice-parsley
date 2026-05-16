'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, Menu, File } from 'lucide-react'
import Link from 'next/link'

export default function ContentManagement() {
  const router = useRouter()
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

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div className="p-8">Loading content management...</div>
  }

  const contentSections = [
    {
      title: 'Homepage Content',
      description: 'Manage hero section, featured apartments, and main content',
      href: '/admin/content/home',
      icon: Home
    },
    {
      title: 'Menu Management',
      description: 'Add, edit, and organize navigation menu items',
      href: '/admin/content/menu',
      icon: Menu
    },
    {
      title: 'Menu Page Content',
      description: 'Edit content for each menu item page (About, Contact, etc.)',
      href: '/admin/content/pages',
      icon: File
    }
  ]

  return (
    <div className="space-y-8 py-8">
      <div className="animate-title">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all website content, images, and information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {contentSections.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{section.description}</p>
                <Link href={section.href}>
                  <Button className="w-full">
                    Manage {section.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-sm text-gray-600">Homepage</p>
              <p className="text-xs text-green-600">Published</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-sm text-gray-600">Menu</p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
