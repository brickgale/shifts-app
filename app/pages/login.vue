<template>
  <NuxtLayout name="default" class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <h2 class="text-2xl font-semibold text-center mb-4">Shifts App</h2>

      <UForm @submit.prevent="onSubmit" class="flex flex-col space-y-4">
        <UFormField
          label="Email"
          name="email"
          :error="submitCount > 0 ? errors.email : undefined"
          required
        >
          <UInput
            v-model="values.email"
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
            v-model="values.password"
            name="password"
            type="password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <UAlert
          v-if="errorMessage"
          type="error"
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
      </UForm>
    </UCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema, type LoginForm } from '~/types/auth'

useSeoMeta({
  title: 'Login - Shifts App',
})

const { login } = useAuth()
const router = useRouter()

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const { values, errors, handleSubmit, isSubmitting, submitCount } = useForm<LoginForm>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: '',
    password: '',
  },
  validateOnMount: false,
})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

const isLoading = ref(false)
const errorMessage = ref('')

const onSubmit = handleSubmit(async (formValues) => {
  if (!isMounted.value) return // Prevent submission before hydration

  isLoading.value = true
  errorMessage.value = ''

  try {
    const user = await login(formValues.email, formValues.password)

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
})
</script>
