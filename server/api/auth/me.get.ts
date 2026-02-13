import { getAuthToken, verifyToken } from '@server/utils/jwt'
import prisma from '@server/utils/prisma'

export default defineEventHandler(async (event) => {
  const token = getAuthToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }

  const payload = verifyToken(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    })
  }

  // Fetch fresh user data from database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found',
    })
  }

  return user
})
