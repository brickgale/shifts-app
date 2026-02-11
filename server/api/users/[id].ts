import prisma from '@server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    })
  }

  const method = getMethod(event)

  // GET /api/users/[id] - Get a single user
  if (method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        shifts: true,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    return user
  }

  // PUT /api/users/[id] - Update a user
  if (method === 'PUT') {
    const body = await readBody(event)
    const { name, email, role } = body

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
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

  // DELETE /api/users/[id] - Delete a user
  if (method === 'DELETE') {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    })

    return { message: 'User deleted successfully' }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
