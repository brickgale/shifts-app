<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar :title="`Welcome, ${user?.name}`">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <div class="p-4 overflow-y-auto">
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
      </div>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { shiftsApi } from '~/api/shifts'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'employee',
})

const { user } = useAuth()

const stats = ref({
  upcomingShifts: 0,
  hoursThisWeek: 0,
  totalShifts: 0,
})

const statCards = computed(() => [
  {
    title: 'Upcoming Shifts',
    icon: 'i-lucide-calendar-clock',
    value: stats.value.upcomingShifts,
    bgColor: 'bg-primary/10',
    ringColor: 'ring-primary/25',
    iconColor: 'text-primary',
  },
  {
    title: 'Hours This Week',
    icon: 'i-lucide-clock',
    value: stats.value.hoursThisWeek,
    bgColor: 'bg-success/10',
    ringColor: 'ring-success/25',
    iconColor: 'text-success',
  },
  {
    title: 'Total Shifts',
    icon: 'i-lucide-calendar-check',
    value: stats.value.totalShifts,
    bgColor: 'bg-info/10',
    ringColor: 'ring-info/25',
    iconColor: 'text-info',
  },
])

onMounted(async () => {
  try {
    // API already returns only employee's shifts based on authentication
    const [shifts] = await Promise.all([
      shiftsApi.list(),
      new Promise((resolve) => setTimeout(resolve, 200)),
    ])

    const now = new Date()
    const upcoming = shifts.filter((s) => new Date(s.startTime) > now)

    stats.value.upcomingShifts = upcoming.length
    stats.value.totalShifts = shifts.length

    // Calculate hours this week
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const thisWeekShifts = shifts.filter((s) => {
      const start = new Date(s.startTime)
      return start >= startOfWeek && start < endOfWeek
    })

    const totalHours = thisWeekShifts.reduce((sum, s) => {
      const start = new Date(s.startTime)
      const end = new Date(s.endTime)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

    stats.value.hoursThisWeek = Math.round(totalHours)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})
</script>
