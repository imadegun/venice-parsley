'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateUserRoleAction } from '@/app/admin/users/actions'

export function UserRoleSelect({ userId, defaultRole }: { userId: string; defaultRole: string }) {
  return (
    <Select
      defaultValue={defaultRole}
      onValueChange={(value) => {
        if (value) updateUserRoleAction(userId, value)
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
