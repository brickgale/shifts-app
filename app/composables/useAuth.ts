import type { User } from '~/types/users'

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const authToken = useCookie('auth_token')

  const fetchUser = async () => {
    if (!authToken.value) {
      user.value = null
      return
    }

    try {
      // Use useRequestFetch() which properly forwards cookies during SSR
      const requestFetch = useRequestFetch()
      const response = await requestFetch<User>('/api/auth/me')

      user.value = response
    } catch (error) {
      user.value = null
      authToken.value = null
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<User & { token: string }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include',
      })

      // Server sets the cookie, but we also need to update the client-side ref
      // so that useCookie() immediately reflects the new value without a page reload
      authToken.value = response.token

      user.value = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      }

      return user.value
    } catch (error: any) {
      throw new Error(error?.data?.message || 'Login failed. Please try again.')
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      user.value = null
      authToken.value = null
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  }
}
