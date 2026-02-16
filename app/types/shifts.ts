import { z } from 'zod'

export type Shift = {
  id: number
  name: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
}

export type ShiftWithUser = Shift & {
  userId: number
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

export const shiftFormSchema = z
  .object({
    id: z.number().optional(),
    name: z
      .string({ required_error: 'Shift name is required' })
      .min(1, 'Shift name is required'),
    userId: z
      .number({ required_error: 'Please select a user' })
      .min(1, 'Please select a user'),
    startTime: z
      .string({ required_error: 'Start time is required' })
      .min(1, 'Start time is required'),
    endTime: z
      .string({ required_error: 'End time is required' })
      .min(1, 'End time is required'),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export type ShiftForm = z.infer<typeof shiftFormSchema>
