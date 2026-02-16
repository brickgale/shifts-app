<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="Shifts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-plus"
            label="Add Shift"
            variant="outline"
            color="primary"
            @click="openAddMode"
          />
        </template>
      </UDashboardNavbar>

      <div class="p-4 overflow-y-auto space-y-4">
        <!-- Calendar -->
        <ShiftsCalendar ref="calendarRef" show-edit-button @edit-shift="handleEditShift" />

        <!-- Shift Form Card -->
        <UCard v-if="formMode !== 'disabled'">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                {{ formMode === 'add' ? 'Add New Shift' : 'Edit Shift' }}
              </h3>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                size="sm"
                @click="closeForm"
              />
            </div>
          </template>

          <form @submit="onSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <UFormField label="Shift Name" name="name" :error="errors.name" required>
                <UInput
                  v-model="name"
                  placeholder="e.g., Morning Shift"
                  class="w-full xl:max-w-full"
                />
              </UFormField>

              <UFormField label="Assign To" name="userId" :error="errors.userId" required>
                <USelectMenu
                  v-model="userId"
                  :items="users"
                  value-key="id"
                  label-key="name"
                  placeholder="Select user"
                  :loading="loadingUsers"
                  class="w-full xl:max-w-full"
                  :filter-fields="['name', 'email']"
                  nullable
                />
              </UFormField>

              <UFormField label="Start Time" name="startTime" :error="errors.startTime" required>
                <UInput v-model="startTime" type="datetime-local" class="w-full xl:max-w-full" />
              </UFormField>

              <UFormField label="End Time" name="endTime" :error="errors.endTime">
                <UInput v-model="endTime" type="datetime-local" class="w-full xl:max-w-full" />
              </UFormField>
            </div>

            <div class="flex justify-end gap-2">
              <UButton
                type="button"
                label="Cancel"
                variant="outline"
                color="neutral"
                @click="closeForm"
              />
              <UButton
                type="submit"
                :label="formMode === 'add' ? 'Create Shift' : 'Update Shift'"
                color="primary"
                :loading="isSubmitting"
              />
            </div>
          </form>
        </UCard>
      </div>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { usersApi } from '~/api/users'
import { shiftsApi } from '~/api/shifts'
import type { User } from '~/types/users'
import type { Shift, ShiftWithUser, ShiftForm } from '~/types/shifts'
import { shiftFormSchema } from '~/types/shifts'
import { formatDateTimeLocal } from '~/utils/formatters'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin',
})

type FormMode = 'disabled' | 'add' | 'edit'

const formMode = ref<FormMode>('disabled')
const loadingUsers = ref(false)
const users = ref<User[]>([])
const calendarRef = ref<{ refreshShifts: () => void } | null>(null)
const currentShiftId = ref<number>(0)

const {
  errors,
  handleSubmit,
  isSubmitting,
  defineField,
  setValues,
  resetForm: veeResetForm,
} = useForm<ShiftForm>({
  validationSchema: toTypedSchema(shiftFormSchema),
  initialValues: {
    id: 0,
    name: '',
    userId: null as any,
    startTime: '',
    endTime: '',
  },
})

const [name] = defineField('name')
const [userId] = defineField('userId')
const [startTime] = defineField('startTime')
const [endTime] = defineField('endTime')

onMounted(async () => {
  loadingUsers.value = true
  try {
    users.value = await usersApi.list()
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loadingUsers.value = false
  }
})

function openAddMode() {
  formMode.value = 'add'
  currentShiftId.value = 0
  resetForm()
}

async function handleEditShift(shiftId: number) {
  formMode.value = 'edit'
  currentShiftId.value = shiftId

  try {
    // Fetch all shifts and find the one we want to edit
    const shifts = await shiftsApi.list()
    const shift = shifts.find((s) => s.id === shiftId) as ShiftWithUser | undefined

    if (shift) {
      setValues({
        id: shift.id,
        name: shift.name,
        userId: shift.userId,
        startTime: formatDateTimeLocal(shift.startTime),
        endTime: formatDateTimeLocal(shift.endTime),
      })
    }
  } catch (error) {
    console.error('Failed to load shift for editing:', error)
  }
}

function closeForm() {
  formMode.value = 'disabled'
  currentShiftId.value = 0
  resetForm()
}

function resetForm() {
  veeResetForm({
    values: {
      id: 0,
      name: '',
      userId: null as any,
      startTime: '',
      endTime: '',
    },
  })
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const shiftPayload: Shift & { userId?: number } = {
      id: currentShiftId.value,
      name: values.name,
      startTime: new Date(values.startTime).toISOString(),
      endTime: new Date(values.endTime).toISOString(),
      userId: values.userId,
    }

    if (formMode.value === 'add') {
      await shiftsApi.create(shiftPayload)
    } else {
      await shiftsApi.update(shiftPayload)
    }

    closeForm()

    // Refresh the calendar to show updated data
    calendarRef.value?.refreshShifts()
  } catch (error) {
    console.error('Failed to save shift:', error)
  }
})
</script>
