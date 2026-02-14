import prisma from '@server/utils/prisma'
import { compare } from 'bcrypt'
import { generateToken, setAuthCookie } from '@server/utils/jwt'
import type { LoginRequest, LoginResponse } from '@server/types/api'

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const body = await readBody<LoginRequest>(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    })
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  }

  // Verify password
  const isPasswordValid = await compare(password, user.password)

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
    })
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  // Set token in httpOnly cookie
  setAuthCookie(event, token)

  // Return user without password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token, // Also return token for client-side storage if needed
  }
})
