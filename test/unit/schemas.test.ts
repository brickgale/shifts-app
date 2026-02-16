import { describe, expect, it } from 'vitest'
import { shiftFormSchema } from '../../app/types/shifts'
import { userFormSchema } from '../../app/types/users'

describe('Validation Schemas', () => {
  describe('shiftFormSchema', () => {
    it('should validate a valid shift form', () => {
      const validShift = {
        name: 'Morning Shift',
        userId: 1,
        startTime: '2024-03-11T08:00',
        endTime: '2024-03-11T16:00',
      }

      const result = shiftFormSchema.safeParse(validShift)
      expect(result.success).toBe(true)
    })

    it('should reject shift without name', () => {
      const invalidShift = {
        userId: 1,
        startTime: '2024-03-11T08:00',
        endTime: '2024-03-11T16:00',
      }

      const result = shiftFormSchema.safeParse(invalidShift)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name')
      }
    })

    it('should reject shift without userId', () => {
      const invalidShift = {
        name: 'Morning Shift',
        startTime: '2024-03-11T08:00',
        endTime: '2024-03-11T16:00',
      }

      const result = shiftFormSchema.safeParse(invalidShift)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('userId')
      }
    })

    it('should reject shift with userId less than 1', () => {
      const invalidShift = {
        name: 'Morning Shift',
        userId: 0,
        startTime: '2024-03-11T08:00',
        endTime: '2024-03-11T16:00',
      }

      const result = shiftFormSchema.safeParse(invalidShift)
      expect(result.success).toBe(false)
    })

    it('should reject shift where endTime is before startTime', () => {
      const invalidShift = {
        name: 'Morning Shift',
        userId: 1,
        startTime: '2024-03-11T16:00',
        endTime: '2024-03-11T08:00',
      }

      const result = shiftFormSchema.safeParse(invalidShift)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('endTime')
        expect(result.error.issues[0].message).toContain('End time must be after start time')
      }
    })

    it('should accept shift with same startTime and endTime as invalid', () => {
      const invalidShift = {
        name: 'Morning Shift',
        userId: 1,
        startTime: '2024-03-11T08:00',
        endTime: '2024-03-11T08:00',
      }

      const result = shiftFormSchema.safeParse(invalidShift)
      expect(result.success).toBe(false)
    })

    it('should accept optional id field', () => {
      const validShift = {
        id: 1,
        name: 'Morning Shift',
        userId: 1,
        startTime: '2024-03-11T08:00',
        endTime: '2024-03-11T16:00',
      }

      const result = shiftFormSchema.safeParse(validShift)
      expect(result.success).toBe(true)
    })
  })

  describe('userFormSchema', () => {
    it('should validate a valid user form for new user', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
        password: 'password123',
      }

      const result = userFormSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject user with invalid email', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        role: 'employee',
        password: 'password123',
      }

      const result = userFormSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
        expect(result.error.issues[0].message).toContain('Invalid email')
      }
    })

    it('should reject user with name less than 2 characters', () => {
      const invalidUser = {
        name: 'J',
        email: 'john@example.com',
        role: 'employee',
        password: 'password123',
      }

      const result = userFormSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject user with invalid role', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'invalid-role',
        password: 'password123',
      }

      const result = userFormSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('should reject new user with short password', () => {
      const invalidUser = {
        id: 0,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
        password: '12345',
      }

      const result = userFormSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 6 characters')
      }
    })

    it('should accept existing user with empty password', () => {
      const validUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
        password: '',
      }

      const result = userFormSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject existing user with short password if provided', () => {
      const invalidUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
        password: '12345',
      }

      const result = userFormSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('should accept optional id field', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        password: 'password123',
      }

      const result = userFormSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should accept both admin and employee roles', () => {
      const adminUser = {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        password: 'password123',
      }

      const employeeUser = {
        name: 'Employee User',
        email: 'employee@example.com',
        role: 'employee',
        password: 'password123',
      }

      expect(userFormSchema.safeParse(adminUser).success).toBe(true)
      expect(userFormSchema.safeParse(employeeUser).success).toBe(true)
    })
  })
})
