import prisma from '@server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // GET /api/shifts - Get all shifts
  if (method === 'GET') {
    const shifts = await prisma.shift.findMany({
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
      orderBy: {
        startTime: 'asc',
      },
    })
    return shifts
  }

  // POST /api/shifts - Create a new shift
  if (method === 'POST') {
    const body = await readBody(event)
    const { name, startTime, endTime, userId } = body

    if (!name || !startTime || !endTime || !userId) {
      throw createError({
        statusCode: 400,
        message: 'Name, startTime, endTime, and userId are required',
      })
    }

    const shift = await prisma.shift.create({
      data: {
        name,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        userId: parseInt(userId),
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

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
