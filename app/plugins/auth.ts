export default defineNuxtPlugin({
  name: 'auth',
  enforce: 'pre',
  async setup() {
    const { fetchUser } = useAuth()
    const authToken = useCookie('auth_token')

    // Restore user state from token on app initialization
    if (authToken.value) {
      await fetchUser()
    }
  },
})
