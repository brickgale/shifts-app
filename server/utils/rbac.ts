import type { H3Event } from 'h3'
import type { Roles } from '~/types/users'
import type { AuthenticatedUser } from '../types/auth'

/**
 * Permission definitions for RBAC
 */
export const Permissions = {
  // Shift permissions
  SHIFT_VIEW_ALL: 'shift:view:all',
  SHIFT_VIEW_OWN: 'shift:view:own',
  SHIFT_CREATE: 'shift:create',
  SHIFT_UPDATE: 'shift:update',
  SHIFT_DELETE: 'shift:delete',

  // User permissions
  USER_VIEW_ALL: 'user:view:all',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
} as const

export type Permission = (typeof Permissions)[keyof typeof Permissions]

/**
 * Role-based permission mapping
 */
const RolePermissions: Record<Roles, Permission[]> = {
  admin: [
    Permissions.SHIFT_VIEW_ALL,
    Permissions.SHIFT_CREATE,
    Permissions.SHIFT_UPDATE,
    Permissions.SHIFT_DELETE,
    Permissions.USER_VIEW_ALL,
    Permissions.USER_CREATE,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
  ],
  employee: [Permissions.SHIFT_VIEW_OWN],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  const userPermissions = RolePermissions[user.role] || []
  return userPermissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: AuthenticatedUser, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: AuthenticatedUser, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission))
}

/**
 * Policy: Can view shift
 * - Admins can view any shift
 * - Employees can only view their own shifts
 */
export function canViewShift(user: AuthenticatedUser, shiftUserId: number): boolean {
  if (hasPermission(user, Permissions.SHIFT_VIEW_ALL)) {
    return true
  }

  if (hasPermission(user, Permissions.SHIFT_VIEW_OWN) && user.id === shiftUserId) {
    return true
  }

  return false
}

/**
 * Policy: Can create shift
 */
export function canCreateShift(user: AuthenticatedUser): boolean {
  return hasPermission(user, Permissions.SHIFT_CREATE)
}

/**
 * Policy: Can update shift
 */
export function canUpdateShift(user: AuthenticatedUser): boolean {
  return hasPermission(user, Permissions.SHIFT_UPDATE)
}

/**
 * Policy: Can delete shift
 */
export function canDeleteShift(user: AuthenticatedUser): boolean {
  return hasPermission(user, Permissions.SHIFT_DELETE)
}

/**
 * Policy: Can view all users
 */
export function canViewUsers(user: AuthenticatedUser): boolean {
  return hasPermission(user, Permissions.USER_VIEW_ALL)
}

/**
 * Policy: Can create user
 */
export function canCreateUser(user: AuthenticatedUser): boolean {
  return hasPermission(user, Permissions.USER_CREATE)
}

/**
 * Policy: Can update user
 */
export function canUpdateUser(user: AuthenticatedUser): boolean {
  return hasPermission(user, Permissions.USER_UPDATE)
}

/**
 * Policy: Can delete user
 */
export function canDeleteUser(user: AuthenticatedUser): boolean {
  return hasPermission(user, Permissions.USER_DELETE)
}

/**
 * Middleware: Require specific permission
 */
export function requirePermission(user: AuthenticatedUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw createError({
      statusCode: 403,
      message: 'Insufficient permissions',
    })
  }
}

/**
 * Middleware: Require any of the specified permissions
 */
export function requireAnyPermission(user: AuthenticatedUser, permissions: Permission[]): void {
  if (!hasAnyPermission(user, permissions)) {
    throw createError({
      statusCode: 403,
      message: 'Insufficient permissions',
    })
  }
}

/**
 * Middleware: Require all of the specified permissions
 */
export function requireAllPermissions(user: AuthenticatedUser, permissions: Permission[]): void {
  if (!hasAllPermissions(user, permissions)) {
    throw createError({
      statusCode: 403,
      message: 'Insufficient permissions',
    })
  }
}
