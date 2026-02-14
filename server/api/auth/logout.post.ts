import { clearAuthCookie } from '@server/utils/jwt'

export default defineEventHandler(async (event): Promise<{ message: string }> => {
  // Clear the auth cookie
  clearAuthCookie(event)

  return {
    message: 'Logged out successfully',
  }
})
