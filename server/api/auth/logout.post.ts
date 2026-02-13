import { clearAuthCookie } from '@server/utils/jwt'

export default defineEventHandler(async (event) => {
  // Clear the auth cookie
  clearAuthCookie(event)

  return {
    message: 'Logged out successfully',
  }
})
