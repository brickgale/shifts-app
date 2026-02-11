<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Redirect to login page on app load
const router = useRouter()
const route = useRoute()

onMounted(() => {
  if (route.path === '/') {
    router.push('/login')
  }
})
</script>
