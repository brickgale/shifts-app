export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()
  const requiredRole = to.meta.role

  // If a specific role is required and user doesn't have it, redirect to their home page
  if (requiredRole && user.value?.role !== requiredRole) {
    return navigateTo(getRoleHomePage(user.value!.role))
  }
})
