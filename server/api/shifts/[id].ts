import prisma from '@server/utils/prisma'
import { requireAuth } from '@server/utils/auth'
import { requirePermission, canViewShift } from '@server/utils/rbac'
import { Permissions } from '@server/utils/rbac'
import type { UpdateShiftRequest, ShiftResponse } from '@server/types/api'

export default defineEventHandler(async (event): Promise<ShiftResponse | { message: string }> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Shift ID is required',
    })
  }

  const method = getMethod(event)
  const shiftId = Number(id)

  // GET /api/shifts/[id] - Get a single shift
  if (method === 'GET') {
    const user = await requireAuth(event)

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
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

    // Check if user can view this shift
    if (!canViewShift(user, shift.userId)) {
      throw createError({
        statusCode: 403,
        message: 'You can only view your own shifts',
      })
    }

    return shift as ShiftResponse
  }

  // PUT /api/shifts/[id] - Update a shift (admin only)
  if (method === 'PUT') {
    const user = await requireAuth(event)
    requirePermission(user, Permissions.SHIFT_UPDATE)

    const body = await readBody<UpdateShiftRequest>(event)
    const { name, startTime, endTime, userId } = body

    const shift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        ...(name && { name }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(userId && { userId: Number(userId) }),
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

    return shift as ShiftResponse
  }

  // DELETE /api/shifts/[id] - Delete a shift (admin only)
  if (method === 'DELETE') {
    const user = await requireAuth(event)
    requirePermission(user, Permissions.SHIFT_DELETE)

    await prisma.shift.delete({
      where: { id: shiftId },
    })

    return { message: 'Shift deleted successfully' }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  })
})
