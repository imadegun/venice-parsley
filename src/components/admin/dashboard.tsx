import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Users } from 'lucide-react'

interface AdminStats {
  totalApartments: number
  totalUsers: number
}

interface AdminDashboardProps {
  stats: AdminStats
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {/* Total Apartments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Apartments</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalApartments}</div>
          <p className="text-xs text-muted-foreground">
            Active apartments
          </p>
        </CardContent>
      </Card>

      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Registered users
          </p>
        </CardContent>
      </Card>
    </div>
  )
}