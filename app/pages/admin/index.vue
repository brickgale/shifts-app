<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent class="p-4 overflow-y-auto">
        <UPageGrid class="lg:grid-cols-3 gap-4 lg:gap-0">
          <UPageCard
            v-for="stat in statCards"
            :key="stat.title"
            :icon="stat.icon"
            :title="stat.title"
            variant="subtle"
            :ui="{
              container: 'gap-y-1.5',
              wrapper: 'items-start',
              leading: `p-2.5 rounded-full ${stat.bgColor} ring ring-inset ${stat.ringColor}`,
              leadingIcon: stat.iconColor,
              title: 'font-normal text-muted text-xs uppercase',
            }"
            class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
          >
            <span class="text-2xl font-semibold text-highlighted">
              {{ stat.value }}
            </span>
          </UPageCard>
        </UPageGrid>

        <ShiftsCalendar class="mt-4 min-h-[calc(100vh-265px)]" />
      </UDashboardPanelContent>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { shiftsApi } from '~/api/shifts'
import { usersApi } from '~/api/users'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin',
})

const stats = ref({
  totalEmployees: 0,
  activeShifts: 0,
  pendingRequests: 0,
})

const statCards = computed(() => [
  {
    title: 'Total Employees',
    icon: 'i-lucide-users',
    value: stats.value.totalEmployees,
    bgColor: 'bg-primary/10',
    ringColor: 'ring-primary/25',
    iconColor: 'text-primary',
  },
  {
    title: 'Active Shifts',
    icon: 'i-lucide-calendar',
    value: stats.value.activeShifts,
    bgColor: 'bg-success/10',
    ringColor: 'ring-success/25',
    iconColor: 'text-success',
  },
  {
    title: 'Pending Requests',
    icon: 'i-lucide-clock',
    value: stats.value.pendingRequests,
    bgColor: 'bg-warning/10',
    ringColor: 'ring-warning/25',
    iconColor: 'text-warning',
  },
])

onMounted(async () => {
  try {
    // Ensure minimum loading time of 200ms for better UX
    const [users, allShifts] = await Promise.all([
      usersApi.list(),
      shiftsApi.list(),
      new Promise((resolve) => setTimeout(resolve, 200)),
    ])

    stats.value.totalEmployees = users.length
    stats.value.activeShifts = allShifts.filter((s) => new Date(s.startTime) > new Date()).length
    stats.value.pendingRequests = 0
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})
</script>
