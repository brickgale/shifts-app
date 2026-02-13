export default defineNuxtRouteMiddleware(async (to, from) => {
  const authToken = useCookie('auth_token')

  // Skip if no token
  if (!authToken.value) {
    return
  }

  const { user, fetchUser } = useAuth()

  // Fetch user if not already loaded
  if (!user.value) {
    await fetchUser()
  }

  // If user exists, redirect to their home page (but not if already going there)
  if (user.value) {
    const homePage = getRoleHomePage(user.value.role)
    // Only redirect if not already going to the home page
    if (to.path !== homePage) {
      return navigateTo(homePage)
    }
  }
})
