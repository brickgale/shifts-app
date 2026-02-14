<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" label="Add Shift" color="primary" />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent>
        <div class="grid gap-4 lg:grid-cols-3">
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-default-500">Total Employees</p>
                <p class="text-2xl font-bold">{{ stats.totalEmployees }}</p>
              </div>
              <UIcon name="i-lucide-users" class="w-8 h-8 text-primary" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-default-500">Active Shifts</p>
                <p class="text-2xl font-bold">{{ stats.activeShifts }}</p>
              </div>
              <UIcon name="i-lucide-calendar" class="w-8 h-8 text-success" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-default-500">Pending Requests</p>
                <p class="text-2xl font-bold">{{ stats.pendingRequests }}</p>
              </div>
              <UIcon name="i-lucide-clock" class="w-8 h-8 text-warning" />
            </div>
          </UCard>
        </div>

        <div class="grid gap-4 lg:grid-cols-2 mt-4">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Recent Shifts</h3>
            </template>

            <div class="space-y-3">
              <div
                v-for="shift in recentShifts"
                :key="shift.id"
                class="flex items-center justify-between p-3 rounded-lg bg-elevated"
              >
                <div>
                  <p class="font-medium">{{ shift.title }}</p>
                  <p class="text-sm text-default-500">{{ formatDate(shift.startTime) }}</p>
                </div>
                <UBadge :color="getShiftStatus(shift.startTime)">
                  {{ getShiftLabel(shift.startTime) }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Quick Actions</h3>
            </template>

            <div class="space-y-2">
              <UButton
                block
                variant="ghost"
                icon="i-lucide-user-plus"
                label="Add Employee"
                justify="start"
              />
              <UButton
                block
                variant="ghost"
                icon="i-lucide-calendar-plus"
                label="Create Shift"
                justify="start"
              />
              <UButton
                block
                variant="ghost"
                icon="i-lucide-file-text"
                label="View Reports"
                justify="start"
              />
            </div>
          </UCard>
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

const recentShifts = ref<any[]>([])

onMounted(async () => {
  try {
    const [usersData, shiftsData] = await Promise.all([$fetch('/api/users'), $fetch('/api/shifts')])

    const users = Array.isArray(usersData) ? usersData : [usersData]
    const shifts = Array.isArray(shiftsData) ? shiftsData : [shiftsData]

    stats.value.totalEmployees = users.length
    stats.value.activeShifts = shifts.filter((s: any) => new Date(s.startTime) > new Date()).length
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
