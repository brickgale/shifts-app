<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <h2 class="text-2xl font-semibold text-center mb-4">Shifts App</h2>

      <UForm :schema="loginSchema" :state="state" @submit="handleSubmit" class="flex flex-col space-y-4">
        <UFormField label="Email" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="your@email.com"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <UAlert
          v-if="errorMessage"
          color="red"
          variant="soft"
          :title="errorMessage"
          :close-button="{ icon: 'i-heroicons-x-mark-20-solid', onClick: () => errorMessage = '' }"
        />

        <UButton type="submit" block :loading="isLoading" class="cursor-pointer">
          Sign In
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { loginSchema, type LoginForm } from '~/types/auth'

useSeoMeta({
  title: 'Login - Shifts App',
})

const { login } = useAuth()
const router = useRouter()

const state = reactive<LoginForm>({
  email: '',
  password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const user = await login(state.email, state.password)

    // Redirect based on role
    if (user.role === 'admin') {
      await router.push('/admin')
    } else {
      await router.push('/employee')
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

</script>
