import { describe, expect, it } from 'vitest'
import { formatDateTimeLocal, toISOString } from '../../app/utils/formatters'

describe('formatters', () => {
  describe('formatDateTimeLocal', () => {
    it('should format ISO 8601 string to datetime-local format', () => {
      const isoString = '2024-03-11T15:30:00.000Z'
      const result = formatDateTimeLocal(isoString)
      
      // Result depends on local timezone, so we check format pattern
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    })

    it('should handle date strings without milliseconds', () => {
      const isoString = '2024-12-25T09:00:00Z'
      const result = formatDateTimeLocal(isoString)
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    })

    it('should pad single-digit months and days with zeros', () => {
      const isoString = '2024-01-05T08:05:00.000Z'
      const result = formatDateTimeLocal(isoString)
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
      // Check that padding exists
      const parts = result.split('T')
      const dateParts = parts[0].split('-')
      expect(dateParts[1]).toHaveLength(2) // Month should be 2 digits
      expect(dateParts[2]).toHaveLength(2) // Day should be 2 digits
    })

    it('should handle midnight correctly', () => {
      const isoString = '2024-06-15T00:00:00.000Z'
      const result = formatDateTimeLocal(isoString)
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    })

    it('should handle end of day correctly', () => {
      const isoString = '2024-06-15T23:59:00.000Z'
      const result = formatDateTimeLocal(isoString)
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    })
  })

  describe('toISOString', () => {
    it('should convert Date object to ISO 8601 string', () => {
      const date = new Date('2024-03-11T15:30:00.000Z')
      const result = toISOString(date)
      
      expect(result).toBe('2024-03-11T15:30:00.000Z')
    })

    it('should convert date string to ISO 8601 string', () => {
      const dateString = '2024-03-11T15:30:00.000Z'
      const result = toISOString(dateString)
      
      expect(result).toBe('2024-03-11T15:30:00.000Z')
    })

    it('should handle various date string formats', () => {
      const dateString = '2024-03-11'
      const result = toISOString(dateString)
      
      expect(result).toContain('2024-03-11')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should produce valid ISO 8601 format', () => {
      const date = new Date(2024, 2, 11, 15, 30, 0)
      const result = toISOString(date)
      
      // Verify it's a valid ISO 8601 string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      
      // Verify it can be parsed back to a date
      const parsedDate = new Date(result)
      expect(parsedDate.getTime()).toBe(date.getTime())
    })
  })
})
