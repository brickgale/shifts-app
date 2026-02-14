import type { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import type { User } from '~/types/users'
import type { JWTPayload } from '../types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

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

export const setAuthCookie = (event: H3Event, token: string): void => {
  setCookie(event, 'auth_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export const clearAuthCookie = (event: H3Event): void => {
  deleteCookie(event, 'auth_token')
}

export const getAuthToken = (event: H3Event): string | undefined => {
  return getCookie(event, 'auth_token')
}
