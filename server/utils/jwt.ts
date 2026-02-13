import jwt from 'jsonwebtoken'
import type { User } from '~/types/users'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export type JWTPayload = Pick<User, 'email' | 'role'> & {
  userId: number
}

export const generateToken = (user: Pick<User, 'id' | 'email' | 'role'>): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export const setAuthCookie = (event: any, token: string) => {
  setCookie(event, 'auth_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export const clearAuthCookie = (event: any) => {
  deleteCookie(event, 'auth_token')
}

export const getAuthToken = (event: any): string | undefined => {
  return getCookie(event, 'auth_token')
}
