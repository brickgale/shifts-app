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

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <UFormField label="Shift Name" name="name" required>
                <UInput
                  v-model="formData.name"
                  placeholder="e.g., Morning Shift"
                  required
                  class="w-full xl:max-w-full"
                />
              </UFormField>

              <UFormField label="Assign To" name="userId" required>
                <USelectMenu
                  v-model="selectedUser"
                  :options="users"
                  value-attribute="id"
                  option-attribute="name"
                  placeholder="Select user"
                  :loading="loadingUsers"
                  required
                  class="w-full xl:max-w-full"
                >
                  <template #label>
                    {{ selectedUser?.name || 'Select user' }}
                  </template>
                </USelectMenu>
              </UFormField>

              <UFormField label="Start Time" name="startTime" required>
                <UInput
                  v-model="formData.startTime"
                  type="datetime-local"
                  required
                  class="w-full xl:max-w-full"
                />
              </UFormField>

              <UFormField label="End Time" name="endTime" required>
                <UInput
                  v-model="formData.endTime"
                  type="datetime-local"
                  required
                  class="w-full xl:max-w-full"
                />
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
                :loading="saving"
              />
            </div>
          </form>
        </UCard>
      </div>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usersApi } from '~/api/users'
import { shiftsApi } from '~/api/shifts'
import type { User } from '~/types/users'
import type { Shift, ShiftWithUser } from '~/types/shifts'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin',
})

type FormMode = 'disabled' | 'add' | 'edit'

const formMode = ref<FormMode>('disabled')
const saving = ref(false)
const loadingUsers = ref(false)
const users = ref<User[]>([])
const calendarRef = ref<{ refreshShifts: () => void } | null>(null)

const formData = ref({
  id: 0,
  name: '',
  startTime: '',
  endTime: '',
  userId: 0,
})

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
  resetForm()
}

async function handleEditShift(shiftId: number) {
  formMode.value = 'edit'

  try {
    // Fetch all shifts and find the one we want to edit
    const shifts = await shiftsApi.list()
    const shift = shifts.find((s) => s.id === shiftId) as ShiftWithUser | undefined

    if (shift) {
      // Find the user from the users list
      const user = users.value.find((u) => u.id === shift.userId)

      formData.value = {
        id: shift.id,
        name: shift.name,
        startTime: formatDateTimeLocal(shift.startTime),
        endTime: formatDateTimeLocal(shift.endTime),
        userId: shift.userId,
      }
      selectedUser.value = user || null
    }
  } catch (error) {
    console.error('Failed to load shift for editing:', error)
  }
}

function closeForm() {
  formMode.value = 'disabled'
  resetForm()
}

function resetForm() {
  formData.value = {
    id: 0,
    name: '',
    startTime: '',
    endTime: '',
    userId: 0,
  }
  selectedUser.value = null
}

function formatDateTimeLocal(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

async function handleSubmit() {
  if (!selectedUser.value) return

  saving.value = true
  try {
    const shiftPayload: Shift & { userId?: number } = {
      id: formData.value.id,
      name: formData.value.name,
      startTime: new Date(formData.value.startTime).toISOString(),
      endTime: new Date(formData.value.endTime).toISOString(),
      userId: selectedUser.value.id,
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
  } finally {
    saving.value = false
  }
}
</script>
