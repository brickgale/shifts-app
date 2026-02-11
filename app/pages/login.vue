<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-2xl font-semibold text-center">Shifts App</h2>
        <p class="text-sm text-gray-500 text-center mt-1">
          Sign in to your account to continue
        </p>
      </template>

      <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
        <UFormField label="Email">
          <UInput
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full"
            required
          />
        </UFormField>

        <UButton type="submit" block>
          Sign In
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Login - Shifts App',
})

const email = ref('')
const password = ref('')

// Auth logic will be implemented in composables later
const handleSubmit = () => {
  console.log('Login attempt with:', { email: email.value, password: password.value })
  // TODO: Implement with useAuth composable
}
</script>
