<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="Users">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-user-plus" label="Add User" variant="outline" color="primary" />
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
                      click: () => editUser(row.original),
                    },
                    {
                      label: 'View Shifts',
                      icon: 'i-lucide-calendar',
                      click: () => viewShifts(row.original),
                    },
                  ],
                  [
                    {
                      label: 'Delete',
                      icon: 'i-lucide-trash-2',
                      color: 'error',
                      click: () => deleteUser(row.original),
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
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usersApi } from '~/api/users'
import { type User, type Roles, ROLES } from '~/types/users'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin',
})

const search = ref('')
const selectedRoleFilter = ref<Roles | 'all'>('all')
const loading = ref(false)
const users = ref<User[]>([])

const roleOptions = computed(() => [
  { value: 'all', label: 'All Roles' },
  ...ROLES.map((role) => ({ value: role, label: role.charAt(0).toUpperCase() + role.slice(1) })),
])

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

const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by role
  if (selectedRoleFilter.value !== 'all') {
    filtered = filtered.filter((user) => user.role === selectedRoleFilter.value)
    console.log('After role filter:', filtered)
  }

  // Filter by search query
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    )
    console.log('After search filter:', filtered)
  }

  console.log('Final filteredUsers:', filtered)
  return filtered
})

onMounted(async () => {
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
})

function editUser(user: User) {
  console.log('Edit user:', user)
  // TODO: Implement edit user modal/form
}

function viewShifts(user: User) {
  console.log('View shifts for:', user)
  // TODO: Navigate to shifts filtered by user or open modal
}

function deleteUser(user: User) {
  console.log('Delete user:', user)
  // TODO: Implement delete confirmation and API call
}
</script>
