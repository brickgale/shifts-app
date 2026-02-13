<template>
  <header class="flex flex-row items-center justify-between ring-1 ring-primary p-4">
    <h1 class="text-2xl font-bold">Shifts App</h1>
    <nav class="flex flex-row gap-2">
      <ColorModeButton variant="outline" />
      <UButton @click="handleLogout" variant="outline"> Logout </UButton>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  await router.push('/login')
}
</script>
