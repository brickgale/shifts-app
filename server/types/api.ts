import type { Roles } from '~/types/users'

// Shift types
export interface CreateShiftRequest {
  name: string
  startTime: string
  endTime: string
  userId: number
}

export interface UpdateShiftRequest {
  name?: string
  startTime?: string
  endTime?: string
  userId?: number
}

export interface ShiftResponse {
  id: number
  name: string
  startTime: Date
  endTime: Date
  userId: number
  user: {
    id: number
    name: string
    email: string
    role: Roles
  }
}

// User types
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: Roles
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: Roles
  password?: string
}

export interface UserResponse {
  id: number
  name: string
  email: string
  role: Roles
  createdAt: Date
  updatedAt: Date
}

export interface UserWithShiftsResponse extends UserResponse {
  shifts: ShiftResponse[]
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: UserResponse
  token: string
}
