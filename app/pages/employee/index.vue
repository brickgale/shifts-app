<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar :title="`Welcome, ${user?.name}`">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-calendar-search" label="View All Shifts" variant="ghost" />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent>
        <div class="grid gap-4 lg:grid-cols-3">
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-default-500">Upcoming Shifts</p>
                <p class="text-2xl font-bold">{{ stats.upcomingShifts }}</p>
              </div>
              <UIcon name="i-lucide-calendar-clock" class="w-8 h-8 text-primary" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-default-500">Hours This Week</p>
                <p class="text-2xl font-bold">{{ stats.hoursThisWeek }}</p>
              </div>
              <UIcon name="i-lucide-clock" class="w-8 h-8 text-success" />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-default-500">Next Shift</p>
                <p class="text-2xl font-bold">{{ stats.nextShift }}</p>
              </div>
              <UIcon name="i-lucide-calendar-check" class="w-8 h-8 text-info" />
            </div>
          </UCard>
        </div>

        <UCard class="mt-4">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">My Upcoming Shifts</h3>
              <UButton icon="i-lucide-filter" size="xs" variant="ghost" color="neutral" />
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="shift in upcomingShifts"
              :key="shift.id"
              class="flex items-start justify-between p-4 rounded-lg bg-elevated border border-default"
            >
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-primary/10">
                  <UIcon name="i-lucide-calendar" class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p class="font-medium">{{ shift.title }}</p>
                  <div class="flex items-center gap-4 mt-1 text-sm text-default-500">
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                      {{ formatDate(shift.startTime) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <UIcon name="i-lucide-clock" class="w-4 h-4" />
                      {{ formatTime(shift.startTime) }} - {{ formatTime(shift.endTime) }}
                    </span>
                  </div>
                  <p v-if="shift.description" class="mt-2 text-sm text-default-600">
                    {{ shift.description }}
                  </p>
                </div>
              </div>
              <UBadge color="success">
                {{ getDaysUntil(shift.startTime) }}
              </UBadge>
            </div>

            <div v-if="upcomingShifts.length === 0" class="text-center py-8 text-default-500">
              <UIcon name="i-lucide-calendar-x" class="w-12 h-12 mx-auto mb-2" />
              <p>No upcoming shifts scheduled</p>
            </div>
          </div>
        </UCard>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  role: 'employee',
})

const { user } = useAuth()

const stats = ref({
  upcomingShifts: 0,
  hoursThisWeek: 0,
  nextShift: '--',
})

const upcomingShifts = ref<any[]>([])

onMounted(async () => {
  try {
    const data = await $fetch('/api/shifts')
    const shifts = Array.isArray(data) ? data : [data]
    const now = new Date()

    const userShifts = shifts.filter((s: any) => s.userId === user.value?.id)
    const upcoming = userShifts
      .filter((s: any) => new Date(s.startTime) > now)
      .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    upcomingShifts.value = upcoming

    stats.value.upcomingShifts = upcoming.length

    // Calculate hours this week
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const thisWeekShifts = userShifts.filter((s: any) => {
      const start = new Date(s.startTime)
      return start >= startOfWeek && start < endOfWeek
    })

    const totalHours = thisWeekShifts.reduce((sum: number, s: any) => {
      const start = new Date(s.startTime)
      const end = new Date(s.endTime)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0)

    stats.value.hoursThisWeek = Math.round(totalHours)

    if (upcoming.length > 0 && upcoming[0]) {
      stats.value.nextShift = getDaysUntil(upcoming[0].startTime)
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDaysUntil(date: string) {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}
</script>
