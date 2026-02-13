<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: async (to, from) => {
    const authToken = useCookie('auth_token')

    if (!authToken.value) {
      return navigateTo('/login')
    }

    const { user, fetchUser } = useAuth()

    if (!user.value) {
      await fetchUser()
    }

    if (user.value) {
      const homePage = getRoleHomePage(user.value.role)
      // Only redirect if their home page is NOT the current page
      if (homePage !== '/') {
        return navigateTo(homePage)
      }
      // Otherwise, let them stay on '/' (for users with role 'user')
    } else {
      return navigateTo('/login')
    }
  },
})
</script>
