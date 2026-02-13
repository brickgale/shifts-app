import prisma from '@server/utils/prisma'
import { hash } from 'bcrypt'

const VALID_ROLES = ['admin', 'employee'] as const

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // GET /api/users - Get all users
  if (method === 'GET') {
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
    return users
  }

  // POST /api/users - Create a new user
  if (method === 'POST') {
    const body = await readBody(event)
    const { name, email, password, role = 'employee' } = body

    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Name, email, and password are required',
      })
    }

    // Validate role
    if (!VALID_ROLES.includes(role as any)) {
      throw createError({
        statusCode: 400,
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
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

    return user
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
