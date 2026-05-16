'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateUserRole } from '@/lib/auth'

export function UserRoleSelect({ userId, defaultRole, onRoleChanged }: { userId: string; defaultRole: string; onRoleChanged?: () => void }) {
  return (
    <Select
      defaultValue={defaultRole}
      onValueChange={(value) => {
        if (value) {
          updateUserRole(userId, value as 'guest' | 'member' | 'admin').then(() => {
            onRoleChanged?.()
          }).catch((error) => {
            console.error('Error updating user role:', error)
            alert('Failed to update user role')
          })
        }
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="guest">Guest</SelectItem>
        <SelectItem value="member">Member</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}
