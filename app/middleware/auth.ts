export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, fetchUser } = useAuth()

  // Fetch user if not already loaded
  if (!user.value) {
    await fetchUser()
  }

  // If still no user after fetch, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
