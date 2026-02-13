# Shifts App

A shift scheduling application built with Nuxt 4, featuring JWT authentication, role-based access control, and a modern UI.

## Features

- 🔐 JWT-based authentication with httpOnly cookies
- 👥 Role-based access control (Admin & Employee)
- 🎨 Modern UI with Nuxt UI & Tailwind CSS
- 📱 Responsive design
- 🌙 Dark mode support
- 📊 Prisma ORM for database management
- ✅ Form validation with VeeValidate & Zod
- 🧪 Vitest for testing

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

- `JWT_SECRET`: A secure random string for JWT token signing
- `DATABASE_URL`: Your database connection string

### 3. Database Setup

Run database migrations:

```bash
pnpm db:migrate
```

Seed the database with sample data:

```bash
pnpm db:seed
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Authentication

See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) for detailed information about the authentication system.

**Default Seed Users:**

- Admin: `admin@example.com` / `password123`
- Employee: `employee@example.com` / `password123`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm format` - Format code with Prettier
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:reset` - Reset database
- `pnpm test` - Run tests

## Project Structure

```
app/
├── components/       # Vue components
├── composables/      # Composable functions (useAuth, etc.)
├── layouts/          # App layouts
├── middleware/       # Route middleware (auth, admin, employee)
├── pages/           # App pages (auto-routing)
├── plugins/         # Nuxt plugins
└── types/           # TypeScript types

server/
├── api/             # API endpoints
├── prisma/          # Database schema & migrations
└── utils/           # Server utilities (JWT, etc.)
```

## Tech Stack

- **Framework:** Nuxt 4
- **UI:** Nuxt UI, Tailwind CSS
- **Database:** Prisma ORM with SQLite
- **Authentication:** JWT with httpOnly cookies
- **Validation:** VeeValidate with Zod schemas
- **Testing:** Vitest
- **Type Safety:** TypeScript

## Documentation

- [Authentication System](docs/AUTHENTICATION.md)
- [Nuxt Documentation](https://nuxt.com/docs)

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
