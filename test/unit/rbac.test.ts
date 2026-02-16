import { describe, expect, it } from 'vitest'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canViewShift,
  canCreateShift,
  canUpdateShift,
  canDeleteShift,
  Permissions,
} from '../../server/utils/rbac'
import type { AuthenticatedUser } from '../../server/types/auth'

describe('RBAC', () => {
  const adminUser: AuthenticatedUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
  }

  const employeeUser: AuthenticatedUser = {
    id: 2,
    name: 'Employee User',
    email: 'employee@test.com',
    role: 'employee',
  }

  describe('hasPermission', () => {
    it('should return true for admin with admin permissions', () => {
      expect(hasPermission(adminUser, Permissions.SHIFT_CREATE)).toBe(true)
      expect(hasPermission(adminUser, Permissions.SHIFT_UPDATE)).toBe(true)
      expect(hasPermission(adminUser, Permissions.SHIFT_DELETE)).toBe(true)
      expect(hasPermission(adminUser, Permissions.USER_VIEW_ALL)).toBe(true)
    })

    it('should return false for employee with admin-only permissions', () => {
      expect(hasPermission(employeeUser, Permissions.SHIFT_CREATE)).toBe(false)
      expect(hasPermission(employeeUser, Permissions.USER_VIEW_ALL)).toBe(false)
    })

    it('should return true for employee with employee permissions', () => {
      expect(hasPermission(employeeUser, Permissions.SHIFT_VIEW_OWN)).toBe(true)
    })

    it('should return false for admin with non-existent permission', () => {
      // @ts-expect-error Testing invalid permission
      expect(hasPermission(adminUser, 'invalid:permission')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', () => {
      expect(
        hasAnyPermission(adminUser, [Permissions.SHIFT_CREATE, Permissions.USER_CREATE])
      ).toBe(true)
    })

    it('should return true if user has at least one permission', () => {
      expect(
        hasAnyPermission(employeeUser, [Permissions.SHIFT_VIEW_OWN, Permissions.SHIFT_CREATE])
      ).toBe(true)
    })

    it('should return false if user has none of the permissions', () => {
      expect(
        hasAnyPermission(employeeUser, [Permissions.SHIFT_CREATE, Permissions.USER_CREATE])
      ).toBe(false)
    })

    it('should handle empty permissions array', () => {
      expect(hasAnyPermission(adminUser, [])).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      expect(
        hasAllPermissions(adminUser, [
          Permissions.SHIFT_CREATE,
          Permissions.SHIFT_UPDATE,
          Permissions.SHIFT_DELETE,
        ])
      ).toBe(true)
    })

    it('should return false if user is missing any permission', () => {
      expect(
        hasAllPermissions(employeeUser, [Permissions.SHIFT_VIEW_OWN, Permissions.SHIFT_CREATE])
      ).toBe(false)
    })

    it('should return true for empty permissions array', () => {
      expect(hasAllPermissions(employeeUser, [])).toBe(true)
    })

    it('should return true for single permission user has', () => {
      expect(hasAllPermissions(employeeUser, [Permissions.SHIFT_VIEW_OWN])).toBe(true)
    })
  })

  describe('canViewShift', () => {
    it('should allow admin to view any shift', () => {
      expect(canViewShift(adminUser, 999)).toBe(true)
      expect(canViewShift(adminUser, 1)).toBe(true)
    })

    it('should allow employee to view their own shift', () => {
      expect(canViewShift(employeeUser, employeeUser.id)).toBe(true)
    })

    it('should prevent employee from viewing other users shifts', () => {
      expect(canViewShift(employeeUser, 999)).toBe(false)
    })
  })

  describe('canCreateShift', () => {
    it('should allow admin to create shifts', () => {
      expect(canCreateShift(adminUser)).toBe(true)
    })

    it('should prevent employee from creating shifts', () => {
      expect(canCreateShift(employeeUser)).toBe(false)
    })
  })

  describe('canUpdateShift', () => {
    it('should allow admin to update shifts', () => {
      expect(canUpdateShift(adminUser)).toBe(true)
    })

    it('should prevent employee from updating shifts', () => {
      expect(canUpdateShift(employeeUser)).toBe(false)
    })
  })

  describe('canDeleteShift', () => {
    it('should allow admin to delete shifts', () => {
      expect(canDeleteShift(adminUser)).toBe(true)
    })

    it('should prevent employee from deleting shifts', () => {
      expect(canDeleteShift(employeeUser)).toBe(false)
    })
  })
})
