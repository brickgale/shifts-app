import prisma from '@server/utils/prisma'
import { hash } from 'bcrypt'
import { requireAuth } from '@server/utils/auth'
import { requirePermission, Permissions } from '@server/utils/rbac'
import { ROLES } from '~/types/users'
import type { Roles } from '~/types/users'
import type { UpdateUserRequest, UserWithShiftsResponse, UserResponse } from '@server/types/api'

export default defineEventHandler(
  async (event): Promise<UserWithShiftsResponse | UserResponse | { message: string }> => {
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required',
      })
    }

    const method = getMethod(event)
    const userId = Number(id)

    // GET /api/users/[id] - Get a single user (admin only)
    if (method === 'GET') {
      requirePermission(user, Permissions.USER_VIEW_ALL)

      const foundUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          shifts: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      })

      if (!foundUser) {
        throw createError({
          statusCode: 404,
          message: 'User not found',
        })
      }

      return foundUser as UserWithShiftsResponse
    }

    // PUT /api/users/[id] - Update a user (admin only)
    if (method === 'PUT') {
      requirePermission(user, Permissions.USER_UPDATE)

      const body = await readBody<UpdateUserRequest>(event)
      const { name, email, role, password } = body

      // Validate role if provided
      if (role && !ROLES.includes(role as Roles)) {
        throw createError({
          statusCode: 400,
          message: `Invalid role. Must be one of: ${ROLES.join(', ')}`,
        })
      }

      // Hash password if provided
      let hashedPassword: string | undefined
      if (password && password.trim() !== '') {
        hashedPassword = await hash(password, 10)
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
          ...(hashedPassword && { password: hashedPassword }),
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

      return updatedUser as UserResponse
    }

    // DELETE /api/users/[id] - Delete a user (admin only)
    if (method === 'DELETE') {
      requirePermission(user, Permissions.USER_DELETE)

      await prisma.user.delete({
        where: { id: userId },
      })

      return { message: 'User deleted successfully' }
    }

    throw createError({
      statusCode: 405,
      message: 'Method not allowed',
    })
  }
)
