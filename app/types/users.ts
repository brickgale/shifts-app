export const ROLES = ['admin', 'employee'] as const
export type Roles = (typeof ROLES)[number]

export type User = {
  id: number
  name: string
  email: string
  role: Roles
}

export type AuthenticatedUser = User & {
  token: string
}
