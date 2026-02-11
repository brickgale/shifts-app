import prisma from '@server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Shift ID is required',
    })
  }

  const method = getMethod(event)

  // GET /api/shifts/[id] - Get a single shift
  if (method === 'GET') {
    const shift = await prisma.shift.findUnique({
      where: { id: parseInt(id) },
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
    })

    if (!shift) {
      throw createError({
        statusCode: 404,
        message: 'Shift not found',
      })
    }

    return shift
  }

  // PUT /api/shifts/[id] - Update a shift
  if (method === 'PUT') {
    const body = await readBody(event)
    const { name, startTime, endTime, userId } = body

    const shift = await prisma.shift.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(userId && { userId: parseInt(userId) }),
      },
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
    })

    return shift
  }

  // DELETE /api/shifts/[id] - Delete a shift
  if (method === 'DELETE') {
    await prisma.shift.delete({
      where: { id: parseInt(id) },
    })

    return { message: 'Shift deleted successfully' }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
