import { requireAuth } from '@server/utils/auth'
import prisma from '@server/utils/prisma'
import type { UserResponse } from '@server/types/api'

export default defineEventHandler(async (event): Promise<UserResponse> => {
  // Use the centralized auth utility
  const authUser = await requireAuth(event)

  // Fetch fresh user data with timestamps
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found',
    })
  }

  return user as UserResponse
})
