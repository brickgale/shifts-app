import { describe, expect, it } from 'vitest'
import { getRoleHomePage } from '../../app/utils/roleHelpers'

describe('roleHelpers', () => {
  describe('getRoleHomePage', () => {
    it('should return /admin for admin role', () => {
      expect(getRoleHomePage('admin')).toBe('/admin')
    })

    it('should return /employee for employee role', () => {
      expect(getRoleHomePage('employee')).toBe('/employee')
    })

    it('should return /employee as default for unknown role', () => {
      // @ts-expect-error Testing invalid role
      expect(getRoleHomePage('unknown')).toBe('/employee')
    })

    it('should handle all valid roles', () => {
      const validRoles: Array<'admin' | 'employee'> = ['admin', 'employee']
      
      validRoles.forEach((role) => {
        const result = getRoleHomePage(role)
        expect(result).toMatch(/^\//)
        expect(result).toBeTruthy()
      })
    })
  })
})
