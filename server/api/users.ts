import prisma from '@server/utils/prisma'
import { hash } from 'bcrypt'
import { requireAuth } from '@server/utils/auth'
import { requirePermission, Permissions } from '@server/utils/rbac'
import { ROLES } from '~/types/users'
import type { Roles } from '~/types/users'
import type { CreateUserRequest, UserResponse } from '@server/types/api'

export default defineEventHandler(async (event): Promise<UserResponse[]> => {
  const method = getMethod(event)

  // GET /api/users - Get all users (admin only)
  if (method === 'GET') {
    const user = await requireAuth(event)
    requirePermission(user, Permissions.USER_VIEW_ALL)

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return users as UserResponse[]
  }

  // POST /api/users - Create a new user (admin only)
  if (method === 'POST') {
    const currentUser = await requireAuth(event)
    requirePermission(currentUser, Permissions.USER_CREATE)

    const body = await readBody<CreateUserRequest>(event)
    const { name, email, password, role = 'employee' } = body

    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Name, email, and password are required',
      })
    }

    // Validate role
    if (!ROLES.includes(role as Roles)) {
      throw createError({
        statusCode: 400,
        message: `Invalid role. Must be one of: ${ROLES.join(', ')}`,
      })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user as unknown as UserResponse[]
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
