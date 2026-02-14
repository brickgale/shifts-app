# Role-Based Access Control (RBAC) Documentation

## Overview

This application implements a comprehensive RBAC system with type-safe policies to control access to resources based on user roles.

## Roles

The system supports two roles:

- **`admin`** - Full access to all resources
- **`employee`** - Limited access to own shifts only

## Permissions

Permissions are defined in [`server/utils/rbac.ts`](../server/utils/rbac.ts):

### Shift Permissions

| Permission       | Description       | Admin | Employee |
| ---------------- | ----------------- | ----- | -------- |
| `SHIFT_VIEW_ALL` | View all shifts   | ✅    | ❌       |
| `SHIFT_VIEW_OWN` | View own shifts   | ❌    | ✅       |
| `SHIFT_CREATE`   | Create new shifts | ✅    | ❌       |
| `SHIFT_UPDATE`   | Update shifts     | ✅    | ❌       |
| `SHIFT_DELETE`   | Delete shifts     | ✅    | ❌       |

### User Permissions

| Permission      | Description      | Admin | Employee |
| --------------- | ---------------- | ----- | -------- |
| `USER_VIEW_ALL` | View all users   | ✅    | ❌       |
| `USER_CREATE`   | Create new users | ✅    | ❌       |
| `USER_UPDATE`   | Update users     | ✅    | ❌       |
| `USER_DELETE`   | Delete users     | ✅    | ❌       |

## API Authorization

### Shifts API

#### `GET /api/shifts`

- **Auth Required**: Yes
- **Permissions**: Any authenticated user
- **Behavior**:
  - Admins see all shifts
  - Employees see only their own shifts

#### `POST /api/shifts`

- **Auth Required**: Yes
- **Permissions**: `SHIFT_CREATE` (admin only)
- **Request Body**:
  ```typescript
  {
    name: string
    startTime: string // ISO 8601 format
    endTime: string // ISO 8601 format
    userId: number
  }
  ```

#### `GET /api/shifts/[id]`

- **Auth Required**: Yes
- **Permissions**: Custom policy
- **Behavior**:
  - Admins can view any shift
  - Employees can only view their own shifts

#### `PUT /api/shifts/[id]`

- **Auth Required**: Yes
- **Permissions**: `SHIFT_UPDATE` (admin only)
- **Request Body**:
  ```typescript
  {
    name?: string
    startTime?: string
    endTime?: string
    userId?: number
  }
  ```

#### `DELETE /api/shifts/[id]`

- **Auth Required**: Yes
- **Permissions**: `SHIFT_DELETE` (admin only)

### Users API

#### `GET /api/users`

- **Auth Required**: Yes
- **Permissions**: `USER_VIEW_ALL` (admin only)

#### `POST /api/users`

- **Auth Required**: Yes
- **Permissions**: `USER_CREATE` (admin only)
- **Request Body**:
  ```typescript
  {
    name: string
    email: string
    password: string
    role?: 'admin' | 'employee'  // defaults to 'employee'
  }
  ```

#### `GET /api/users/[id]`

- **Auth Required**: Yes
- **Permissions**: `USER_VIEW_ALL` (admin only)

#### `PUT /api/users/[id]`

- **Auth Required**: Yes
- **Permissions**: `USER_UPDATE` (admin only)
- **Request Body**:
  ```typescript
  {
    name?: string
    email?: string
    role?: 'admin' | 'employee'
  }
  ```

#### `DELETE /api/users/[id]`

- **Auth Required**: Yes
- **Permissions**: `USER_DELETE` (admin only)

## Usage in API Routes

### Basic Authorization

```typescript
import { requireAuth } from '@server/utils/auth'
import { requirePermission, Permissions } from '@server/utils/rbac'

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event)

  // Require specific permission
  requirePermission(user, Permissions.SHIFT_CREATE)

  // Your route logic here
})
```

### Custom Policy

```typescript
import { requireAuth } from '@server/utils/auth'
import { canViewShift } from '@server/utils/rbac'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Custom policy check
  if (!canViewShift(user, shiftUserId)) {
    throw createError({
      statusCode: 403,
      message: 'You can only view your own shifts',
    })
  }

  // Your route logic here
})
```

### Multiple Permissions

```typescript
import { requireAuth } from '@server/utils/auth'
import { requireAnyPermission, Permissions } from '@server/utils/rbac'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Require any of the specified permissions
  requireAnyPermission(user, [Permissions.SHIFT_VIEW_ALL, Permissions.SHIFT_VIEW_OWN])

  // Your route logic here
})
```

## Type Safety

All API routes are fully typed with TypeScript:

### Request/Response Types

Located in [`server/types/api.ts`](../server/types/api.ts):

```typescript
// Shift types
interface CreateShiftRequest {
  name: string
  startTime: string
  endTime: string
  userId: number
}

interface ShiftResponse {
  id: number
  name: string
  startTime: Date
  endTime: Date
  userId: number
  user: {
    id: number
    name: string
    email: string
    role: Roles
  }
}

// User types
interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: Roles
}

interface UserResponse {
  id: number
  name: string
  email: string
  role: Roles
  createdAt: Date
  updatedAt: Date
}
```

### Auth Types

Located in [`server/types/auth.ts`](../server/types/auth.ts):

```typescript
interface AuthenticatedUser {
  id: number
  name: string
  email: string
  role: Roles
}

interface JWTPayload {
  userId: number
  email: string
  role: Roles
}
```

## Frontend Integration

Frontend routes are protected by middleware:

```typescript
definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin', // or 'employee'
})
```

## Error Responses

### 401 Unauthorized

- No authentication token provided
- Invalid or expired token
- User not found

### 403 Forbidden

- Insufficient permissions for the requested action
- Attempting to view another user's shifts (employees only)

### 400 Bad Request

- Missing required fields
- Invalid role specified

## Best Practices

1. **Always use `requireAuth`** at the start of protected routes
2. **Use permission checks** instead of role checks when possible
3. **Leverage policy functions** for complex authorization logic
4. **Type all request/response bodies** using the types in `server/types/api.ts`
5. **Avoid using `any` type** - use proper TypeScript types
6. **Use `Number()` instead of `parseInt()`** for better type inference

## Adding New Permissions

1. Add the permission to `Permissions` in [`server/utils/rbac.ts`](../server/utils/rbac.ts)
2. Update `RolePermissions` to assign the permission to roles
3. Create a policy function if needed
4. Apply the permission check in the relevant API route
5. Update this documentation

## Example: Complete Route Implementation

```typescript
import prisma from '@server/utils/prisma'
import { requireAuth } from '@server/utils/auth'
import { requirePermission, Permissions } from '@server/utils/rbac'
import type { CreateShiftRequest, ShiftResponse } from '@server/types/api'

export default defineEventHandler(async (event): Promise<ShiftResponse> => {
  // 1. Authenticate the user
  const user = await requireAuth(event)

  // 2. Check permissions
  requirePermission(user, Permissions.SHIFT_CREATE)

  // 3. Validate and parse request body
  const body = await readBody<CreateShiftRequest>(event)
  const { name, startTime, endTime, userId } = body

  if (!name || !startTime || !endTime || !userId) {
    throw createError({
      statusCode: 400,
      message: 'Name, startTime, endTime, and userId are required',
    })
  }

  // 4. Execute business logic
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

  // 5. Return typed response
  return shift as ShiftResponse
})
```

## Security Considerations

- ✅ All sensitive routes require authentication
- ✅ Role-based permissions enforced server-side
- ✅ Employees cannot access other users' data
- ✅ Type safety prevents runtime errors
- ✅ JWT tokens are validated on every request
- ✅ Passwords are hashed with bcrypt
- ✅ SQL injection prevented by Prisma ORM

## Testing Authorization

When testing protected routes, include the auth token:

```typescript
// Login first
const { token } = await $fetch('/api/auth/login', {
  method: 'POST',
  body: { email: 'admin@example.com', password: 'password' },
})

// Make authenticated request
const shifts = await $fetch('/api/shifts', {
  headers: {
    Cookie: `auth_token=${token}`,
  },
})
```
