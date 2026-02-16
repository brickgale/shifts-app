import { z } from 'zod'

export const ROLES = ['admin', 'employee'] as const
export type Roles = (typeof ROLES)[number]

export type User = {
  id: number
  name: string
  email: string
  role: Roles
}

export type AuthenticatedUser = User & {
  token: string
}

export const userFormSchema = z
  .object({
    id: z.number().optional(),
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .min(1, 'Email is required')
      .email('Invalid email address'),
    role: z.enum(ROLES, { required_error: 'Please select a role' }),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      // Password is required for new users (when id is 0 or undefined)
      if (!data.id || data.id === 0) {
        return data.password && data.password.length >= 6
      }
      // For existing users, password is optional but must be 6+ chars if provided
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6
      }
      return true
    },
    {
      message: 'Password must be at least 6 characters',
      path: ['password'],
    }
  )

export type UserForm = z.infer<typeof userFormSchema>
