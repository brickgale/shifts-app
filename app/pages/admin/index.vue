<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" label="Add Shift" variant="outline" color="primary" />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent class="p-4">
        <UPageGrid class="lg:grid-cols-3 gap-4">
          <UPageCard
            icon="i-lucide-users"
            title="Total Employees"
            variant="subtle"
            :ui="{
              container: 'gap-y-1.5',
              wrapper: 'items-start',
              leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25',
              leadingIcon: 'text-primary',
              title: 'font-normal text-muted text-xs uppercase',
            }"
          >
            <span class="text-2xl font-semibold text-highlighted">
              {{ stats.totalEmployees }}
            </span>
          </UPageCard>

          <UPageCard
            icon="i-lucide-calendar"
            title="Active Shifts"
            variant="subtle"
            :ui="{
              container: 'gap-y-1.5',
              wrapper: 'items-start',
              leading: 'p-2.5 rounded-full bg-success/10 ring ring-inset ring-success/25',
              leadingIcon: 'text-success',
              title: 'font-normal text-muted text-xs uppercase',
            }"
          >
            <span class="text-2xl font-semibold text-highlighted">
              {{ stats.activeShifts }}
            </span>
          </UPageCard>

          <UPageCard
            icon="i-lucide-clock"
            title="Pending Requests"
            variant="subtle"
            :ui="{
              container: 'gap-y-1.5',
              wrapper: 'items-start',
              leading: 'p-2.5 rounded-full bg-warning/10 ring ring-inset ring-warning/25',
              leadingIcon: 'text-warning',
              title: 'font-normal text-muted text-xs uppercase',
            }"
          >
            <span class="text-2xl font-semibold text-highlighted">
              {{ stats.pendingRequests }}
            </span>
          </UPageCard>
        </UPageGrid>

        <div class="grid gap-4 lg:grid-cols-2 mt-4">
          <UPageCard
            title="Recent Shifts"
            variant="subtle"
            :ui="{
              root: 'flex flex-col h-full',
              container: 'divide-y divide-default',
              title: 'mb-2',
            }"
          >
            <div
              v-for="shift in recentShifts"
              :key="shift.id"
              class="flex items-center justify-between p-4"
            >
              <div>
                <p class="font-medium">{{ shift.name }}</p>
                <p class="text-sm text-muted">{{ formatDate(shift.startTime) }}</p>
              </div>
              <UBadge :color="getShiftStatus(shift.startTime)" variant="subtle">
                {{ getShiftLabel(shift.startTime) }}
              </UBadge>
            </div>
          </UPageCard>

          <UPageCard
            title="Quick Actions"
            variant="subtle"
            :ui="{
              root: 'flex flex-col shrink-0',
              container: 'divide-y divide-default flex-1',
              title: 'mb-2',
            }"
          >
            <div class="flex flex-col h-full">
              <UButton
                block
                variant="ghost"
                icon="i-lucide-user-plus"
                label="Add Employee"
                justify="start"
                color="neutral"
                class="!rounded-none flex-1 !p-4"
              />
              <UButton
                block
                variant="ghost"
                icon="i-lucide-calendar-plus"
                label="Create Shift"
                justify="start"
                color="neutral"
                class="!rounded-none flex-1 !p-4"
              />
              <UButton
                block
                variant="ghost"
                icon="i-lucide-file-text"
                label="View Reports"
                justify="start"
                color="neutral"
                class="!rounded-none flex-1 !p-4"
              />
            </div>
          </UPageCard>
        </div>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin',
})

const stats = ref({
  totalEmployees: 0,
  activeShifts: 0,
  pendingRequests: 0,
})

interface ShiftWithUser {
  id: number
  name: string
  startTime: string
  endTime: string
  userId: number
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

const recentShifts = ref<ShiftWithUser[]>([])

onMounted(async () => {
  try {
    const [usersData, shiftsData] = await Promise.all([
      $fetch<{ id: number; name: string; email: string; role: string }[]>('/api/users'),
      $fetch<ShiftWithUser[]>('/api/shifts'),
    ])

    const users = Array.isArray(usersData) ? usersData : [usersData]
    const shifts = Array.isArray(shiftsData) ? shiftsData : [shiftsData]

    stats.value.totalEmployees = users.length
    stats.value.activeShifts = shifts.filter((s) => new Date(s.startTime) > new Date()).length
    stats.value.pendingRequests = 0

    recentShifts.value = shifts.slice(0, 5)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getShiftStatus(startTime: string) {
  const now = new Date()
  const start = new Date(startTime)
  return start > now ? 'success' : 'neutral'
}

function getShiftLabel(startTime: string) {
  const now = new Date()
  const start = new Date(startTime)
  return start > now ? 'Upcoming' : 'Completed'
}
</script>
