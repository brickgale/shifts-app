import prisma from '@server/utils/prisma'
import { requireAuth } from '@server/utils/auth'
import { requirePermission, Permissions } from '@server/utils/rbac'
import type { CreateShiftRequest, ShiftResponse } from '@server/types/api'

export default defineEventHandler(async (event): Promise<ShiftResponse[]> => {
  const method = getMethod(event)

  // GET /api/shifts - Get shifts based on user role
  if (method === 'GET') {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const dateParam = query.date as string | undefined

    // Build date filter if date parameter is provided
    let dateFilter = {}
    if (dateParam) {
      // Parse date string (YYYY-MM-DD) and create Date objects without timezone issues
      const parts = dateParam.split('-').map(Number)
      if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
        const year = parts[0]!
        const month = parts[1]!
        const day = parts[2]!
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

        dateFilter = {
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        }
      }
    }

    // Admins can see all shifts
    if (user.role === 'admin') {
      const shifts = await prisma.shift.findMany({
        where: dateFilter,
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
      return shifts as ShiftResponse[]
    }

    // Employees can only see their own shifts
    const shifts = await prisma.shift.findMany({
      where: {
        userId: user.id,
        ...dateFilter,
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
      orderBy: {
        startTime: 'asc',
      },
    })
    return shifts as ShiftResponse[]
  }

  // POST /api/shifts - Create a new shift (admin only)
  if (method === 'POST') {
    const user = await requireAuth(event)
    requirePermission(user, Permissions.SHIFT_CREATE)

    const body = await readBody<CreateShiftRequest>(event)
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
        userId: Number(userId),
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

    return shift as unknown as ShiftResponse[]
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
