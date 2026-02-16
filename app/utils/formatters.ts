/**
 * Converts an ISO 8601 date string to a format suitable for datetime-local inputs
 * @param dateString - ISO 8601 date string (e.g., "2024-03-11T15:30:00.000Z")
 * @returns Formatted string in YYYY-MM-DDTHH:mm format
 */
export function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Converts a Date object or ISO string to ISO 8601 format
 * @param date - Date object or string
 * @returns ISO 8601 formatted string
 */
export function toISOString(date: Date | string): string {
  return new Date(date).toISOString()
}
