import type { Roles } from '~/types/users'

export const getRoleHomePage = (role: Roles): string => {
  const roleRouteMap: Record<Roles, string> = {
    admin: '/admin',
    employee: '/employee',
  }

  return roleRouteMap[role] || '/employee'
}
