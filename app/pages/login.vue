<template>
  <NuxtLayout name="default" class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm relative">
      <ColorModeButton class="absolute top-2 right-2" v-if="isMounted" />
      <h2 class="text-2xl font-semibold text-center mb-4">Shifts App</h2>
      <form @submit.prevent="onSubmit" class="flex flex-col space-y-4">
        <UFormField
          label="Email"
          name="email"
          :error="submitCount > 0 ? errors.email : undefined"
          required
        >
          <UInput
            v-model="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
          :error="submitCount > 0 ? errors.password : undefined"
          required
        >
          <UInput
            v-model="password"
            name="password"
            type="password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          :title="errorMessage"
          :close-button="{
            icon: 'i-heroicons-x-mark-20-solid',
            onClick: () => (errorMessage = ''),
          }"
        />

        <UButton type="submit" block :loading="isSubmitting" :disabled="!isMounted">
          Sign In
        </UButton>
      </form>
    </UCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema, type LoginForm } from '~/types/auth'

definePageMeta({
  middleware: ['guest'],
})

useSeoMeta({
  title: 'Login - Shifts App',
})

const { login } = useAuth()

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const { errors, handleSubmit, isSubmitting, submitCount, defineField } = useForm<LoginForm>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: '',
    password: '',
  },
  validateOnMount: false,
})

const [email] = defineField('email')
const [password] = defineField('password')

const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = handleSubmit(
  async (formValues) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const user = await login(formValues.email, formValues.password)

      // Redirect to user's appropriate home page
      await navigateTo(getRoleHomePage(user.role))
    } catch (error: any) {
      errorMessage.value = error.message || 'Login failed. Please try again.'
    } finally {
      isLoading.value = false
    }
  },
  (errors) => {
    console.error('Validation failed:', errors)
  }
)
</script>
