import type { H3Event } from 'h3'
import { verifyToken, getAuthToken } from './jwt'
import prisma from './prisma'
import type { AuthenticatedUser } from '../types/auth'

/**
 * Get the authenticated user from the request
 * Throws 401 if not authenticated
 */
export async function requireAuth(event: H3Event): Promise<AuthenticatedUser> {
  const token = getAuthToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  const payload = verifyToken(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    })
  }

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

  return user as AuthenticatedUser
}

/**
 * Get the authenticated user from the request, or null if not authenticated
 * Does not throw an error
 */
export async function getAuthUser(event: H3Event): Promise<AuthenticatedUser | null> {
  try {
    return await requireAuth(event)
  } catch {
    return null
  }
}
