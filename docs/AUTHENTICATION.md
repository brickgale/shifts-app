# Authentication System

This application uses JWT (JSON Web Token) based authentication with httpOnly cookies for security.

## Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `JWT_SECRET` in your `.env` file with a secure random string:
   ```
   JWT_SECRET=your-very-secure-random-string-here
   ```

## How it works

### Login Flow

1. User submits email and password to `/api/auth/login`
2. Server validates credentials against the database
3. If valid, server generates a JWT token containing user ID, email, and role
4. Token is set as an httpOnly cookie (`auth_token`)
5. Token is also returned in response for compatibility
6. User data is stored in the app state

### Authentication Persistence

- JWT token is stored in an httpOnly cookie (secure, not accessible via JavaScript)
- On app initialization, the auth plugin fetches user data using the token
- Token is automatically included in all API requests via the cookie

### Protected Routes

- Use middleware to protect routes: `definePageMeta({ middleware: ['auth'] })`
- Available middleware:
  - `auth` - Requires authentication
  - `admin` - Requires admin role
  - `employee` - Requires employee role
  - `guest` - Only for unauthenticated users (login page)

### Logout Flow

1. User clicks logout
2. Server clears the `auth_token` cookie
3. Client clears user state
4. User is redirected to login page

## Security Features

- **httpOnly cookies**: Prevents XSS attacks from accessing tokens
- **JWT expiration**: Tokens expire after 7 days
- **Secure flag**: In production, cookies are only sent over HTTPS
- **SameSite**: Prevents CSRF attacks
- **Password hashing**: Uses bcrypt for password storage

## Token Structure

The JWT payload contains:

```typescript
{
  userId: number
  email: string
  role: string
  iat: number // issued at
  exp: number // expiration
}
```

## API Endpoints

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear cookie
- `GET /api/auth/me` - Get current user from token
