import type { Roles } from '~/types/users'

export interface AuthenticatedUser {
  id: number
  name: string
  email: string
  role: Roles
}

export interface JWTPayload {
  userId: number
  email: string
  role: Roles
}
