import { type Shift, type ShiftWithUser } from '~/types/shifts'

export const shiftsApi = {
  list(date?: string): Promise<ShiftWithUser[]> {
    return $fetch('/api/shifts', {
      query: date ? { date } : undefined,
    })
  },
  create(shift: Shift): Promise<Shift> {
    return $fetch('/api/shifts', {
      method: 'POST',
      body: shift,
    })
  },
  update(shift: Shift): Promise<Shift> {
    return $fetch(`/api/shifts/${shift.id}`, {
      method: 'PUT',
      body: shift,
    })
  },
  delete(id: number): Promise<void> {
    return $fetch(`/api/shifts/${id}`, {
      method: 'DELETE',
    })
  },
}
