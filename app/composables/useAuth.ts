import type { User } from '~/types/users'

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<User>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      user.value = response
      return response
    } catch (error: any) {
      // Re-throw with a user-friendly message
      throw new Error(error?.data?.message || 'Login failed. Please try again.')
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      // Log error but don't prevent logout
      console.error('Logout API error:', error)
    } finally {
      // Always clear user state, even if API fails
      user.value = null
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  }
}
