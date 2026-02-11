// Auth composable - to be implemented
export const useAuth = () => {
  const user = useState('user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    // TODO: Implement authentication logic
    console.log('Login:', email, password)
  }

  const logout = async () => {
    // TODO: Implement logout logic
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  }
}
