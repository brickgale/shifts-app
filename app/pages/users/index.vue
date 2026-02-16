<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="Users">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-user-plus"
            label="Add User"
            variant="outline"
            color="primary"
            @click="openAddMode"
          />
        </template>
      </UDashboardNavbar>

      <div class="p-4 overflow-y-auto">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">User List</h3>
              <div class="flex items-center gap-2">
                <USelect
                  v-model="selectedRoleFilter"
                  :items="roleOptions"
                  value-attribute="value"
                  option-attribute="label"
                  class="w-48"
                />
                <UInput
                  v-model="search"
                  icon="i-lucide-search"
                  placeholder="Search users..."
                  class="w-64"
                />
              </div>
            </div>
          </template>

          <UTable :data="filteredUsers" :columns="columns" :loading="loading">
            <template #name-cell="{ row }">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="`https://ui-avatars.com/api/?name=${row.original.name}&background=random`"
                  :alt="row.original.name"
                  size="sm"
                />
                <div>
                  <p class="font-medium">{{ row.original.name }}</p>
                </div>
              </div>
            </template>

            <template #role-cell="{ row }">
              <UBadge
                :color="row.original.role === 'admin' ? 'primary' : 'neutral'"
                variant="subtle"
              >
                {{ row.original.role }}
              </UBadge>
            </template>

            <template #actions-cell="{ row }">
              <UDropdownMenu
                :items="[
                  [
                    {
                      label: 'Edit',
                      icon: 'i-lucide-pencil',
                      onClick: () => openEditMode(row.original),
                    },
                    {
                      label: 'View Shifts',
                      icon: 'i-lucide-calendar',
                      onClick: () => viewShifts(row.original),
                    },
                  ],
                  [
                    {
                      label: 'Delete',
                      icon: 'i-lucide-trash-2',
                      color: 'error',
                      onClick: () => handleDeleteUser(row.original),
                    },
                  ],
                ]"
              >
                <UButton
                  icon="i-lucide-more-horizontal"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                />
              </UDropdownMenu>
            </template>
          </UTable>
        </UCard>
      </div>
      <!-- User Form Modal -->
      <UModal
        v-model:open="isModalOpen"
        :title="formMode === 'add' ? 'Add New User' : 'Edit User'"
        size="md"
      >
        <template #body>
          <form @submit="onSubmit" class="space-y-4">
            <UFormField label="Name" name="name" :error="errors.name" required>
              <UInput v-model="name" placeholder="e.g., John Doe" class="w-full" />
            </UFormField>

            <UFormField label="Email" name="email" :error="errors.email" required>
              <UInput
                v-model="email"
                type="email"
                placeholder="e.g., john@example.com"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Role" name="role" :error="errors.role" required>
              <USelectMenu
                v-model="role"
                :items="roleItems"
                value-key="value"
                label-key="label"
                placeholder="Select role"
                nullable
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="formMode === 'add' ? 'Password' : 'Password (leave empty to keep current)'"
              name="password"
              :error="errors.password"
              :required="formMode === 'add'"
            >
              <UInput
                v-model="password"
                type="password"
                :placeholder="
                  formMode === 'add' ? 'Min. 6 characters' : 'Leave empty to keep current'
                "
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                type="button"
                label="Cancel"
                variant="outline"
                color="neutral"
                @click="closeModal"
              />
              <UButton
                type="submit"
                :label="formMode === 'add' ? 'Create User' : 'Update User'"
                color="primary"
                :loading="isSubmitting"
              />
            </div>
          </form>
        </template>
      </UModal>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { usersApi } from '~/api/users'
import { type User, type Roles, type UserForm, ROLES, userFormSchema } from '~/types/users'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin',
})

type FormMode = 'add' | 'edit'

const search = ref('')
const selectedRoleFilter = ref<Roles | 'all'>('all')
const loading = ref(false)
const users = ref<User[]>([])
const isModalOpen = ref(false)
const formMode = ref<FormMode>('add')
const currentUserId = ref<number>(0)

const roleOptions = computed(() => [
  { value: 'all', label: 'All Roles' },
  ...ROLES.map((role) => ({ value: role, label: role.charAt(0).toUpperCase() + role.slice(1) })),
])

const roleItems = computed(() =>
  ROLES.map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  }))
)

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    header: '',
  },
]

const {
  errors,
  handleSubmit,
  isSubmitting,
  defineField,
  setValues,
  resetForm: veeResetForm,
} = useForm<UserForm>({
  validationSchema: toTypedSchema(userFormSchema),
  initialValues: {
    id: 0,
    name: '',
    email: '',
    role: null as any,
    password: '',
  },
})

const [name] = defineField('name')
const [email] = defineField('email')
const [role] = defineField('role')
const [password] = defineField('password')
const [id] = defineField('id')

const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by role
  if (selectedRoleFilter.value !== 'all') {
    filtered = filtered.filter((user) => user.role === selectedRoleFilter.value)
  }

  // Filter by search query
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    )
  }

  return filtered
})

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    // Ensure minimum loading time of 200ms for better UX
    const [usersList] = await Promise.all([
      usersApi.list(),
      new Promise((resolve) => setTimeout(resolve, 200)),
    ])
    users.value = usersList
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

function openAddMode() {
  formMode.value = 'add'
  currentUserId.value = 0
  resetForm()
  isModalOpen.value = true
}

function openEditMode(user: User) {
  formMode.value = 'edit'
  currentUserId.value = user.id
  setValues({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password: '',
  })
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  currentUserId.value = 0
  resetForm()
}

function resetForm() {
  veeResetForm({
    values: {
      id: 0,
      name: '',
      email: '',
      role: null as any,
      password: '',
    },
  })
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const userPayload: any = {
      id: values.id || 0,
      name: values.name,
      email: values.email,
      role: values.role,
    }

    // Only include password if it's provided
    if (values.password && values.password.trim() !== '') {
      userPayload.password = values.password
    }

    if (formMode.value === 'add') {
      await usersApi.create(userPayload)
    } else {
      await usersApi.update(userPayload)
    }

    closeModal()
    await loadUsers()
  } catch (error) {
    console.error('Failed to save user:', error)
  }
})

async function handleDeleteUser(user: User) {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    try {
      await usersApi.delete(user.id)
      await loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}

function viewShifts(user: User) {
  console.log('View shifts for:', user)
  // TODO: Navigate to shifts filtered by user or open modal
}
</script>
