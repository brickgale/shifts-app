import type { Roles } from './users'

declare module '#app' {
  interface PageMeta {
    role?: Roles
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    role?: Roles
  }
}

export {}
