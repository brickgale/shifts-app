<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="My Shifts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <div class="p-4 overflow-y-auto space-y-4">
        <!-- Calendar -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Calendar View</h3>
          </template>
          <ShiftsCalendar />
        </UCard>

        <!-- Upcoming Shifts List -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Upcoming Shifts</h3>
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Search shifts..."
                class="w-64"
              />
            </div>
          </template>

          <USkeleton v-if="loading" class="h-32" />

          <div v-else-if="filteredShifts.length === 0" class="text-center py-12 text-muted">
            <UIcon name="i-lucide-calendar-x" class="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p class="text-lg font-medium">No shifts found</p>
            <p class="text-sm mt-1">
              {{ search ? 'Try adjusting your search' : 'You have no upcoming shifts scheduled' }}
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="shift in filteredShifts"
              :key="shift.id"
              class="flex items-start justify-between p-4 rounded-lg bg-elevated border border-default hover:border-primary/50 transition-colors"
            >
              <div class="flex items-start gap-4 flex-1">
                <div class="p-2.5 rounded-lg bg-primary/10 ring ring-inset ring-primary/25">
                  <UIcon name="i-lucide-calendar" class="w-5 h-5 text-primary" />
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-highlighted">{{ shift.name }}</p>
                  <div class="flex items-center gap-4 mt-2 text-sm text-muted">
                    <span class="flex items-center gap-1.5">
                      <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                      {{ formatDate(shift.startTime) }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <UIcon name="i-lucide-clock" class="w-4 h-4" />
                      {{ formatTime(shift.startTime) }} - {{ formatTime(shift.endTime) }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <UIcon name="i-lucide-timer" class="w-4 h-4" />
                      {{ calculateDuration(shift.startTime, shift.endTime) }}
                    </span>
                  </div>
                </div>
              </div>
              <UBadge :color="getBadgeColor(shift.startTime)" variant="subtle">
                {{ getDaysUntil(shift.startTime) }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <!-- Past Shifts -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Past Shifts</h3>
              <span class="text-sm text-muted">Last 30 days</span>
            </div>
          </template>

          <USkeleton v-if="loading" class="h-32" />

          <div v-else-if="pastShifts.length === 0" class="text-center py-8 text-muted">
            <UIcon name="i-lucide-calendar-check" class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No past shifts in the last 30 days</p>
          </div>

          <UTable
            v-else
            :data="pastShifts"
            :columns="pastShiftsColumns"
            :ui="{ td: { base: 'py-3' } }"
          >
            <template #name-cell="{ row }">
              <div class="flex items-center gap-2">
                <div class="p-1.5 rounded bg-neutral/10 ring ring-inset ring-neutral/25">
                  <UIcon name="i-lucide-calendar-check" class="w-3.5 h-3.5 text-neutral" />
                </div>
                <span class="font-medium">{{ row.original.name }}</span>
              </div>
            </template>

            <template #date-cell="{ row }">
              <span class="text-sm text-muted">{{ formatDate(row.original.startTime) }}</span>
            </template>

            <template #time-cell="{ row }">
              <span class="text-sm text-muted">
                {{ formatTime(row.original.startTime) }} - {{ formatTime(row.original.endTime) }}
              </span>
            </template>

            <template #duration-cell="{ row }">
              <span class="text-sm font-medium">
                {{ calculateDuration(row.original.startTime, row.original.endTime) }}
              </span>
            </template>
          </UTable>
        </UCard>
      </div>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { shiftsApi } from '~/api/shifts'
import type { ShiftWithUser } from '~/types/shifts'

definePageMeta({
  middleware: ['auth', 'role'],
  role: 'employee',
})

const { user } = useAuth()

const loading = ref(false)
const search = ref('')
const shifts = ref<ShiftWithUser[]>([])

const pastShiftsColumns = [
  {
    accessorKey: 'name',
    header: 'Shift Name',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'time',
    header: 'Time',
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
  },
]

const upcomingShifts = computed(() => {
  const now = new Date()
  return shifts.value
    .filter((s) => new Date(s.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
})

const pastShifts = computed(() => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return shifts.value
    .filter((s) => {
      const shiftDate = new Date(s.startTime)
      return shiftDate < now && shiftDate > thirtyDaysAgo
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
})

const filteredShifts = computed(() => {
  if (!search.value) return upcomingShifts.value

  const query = search.value.toLowerCase()
  return upcomingShifts.value.filter((shift) => shift.name.toLowerCase().includes(query))
})

onMounted(async () => {
  await loadShifts()
})

async function loadShifts() {
  loading.value = true
  try {
    // API already returns only employee's shifts based on authentication
    const [employeeShifts] = await Promise.all([
      shiftsApi.list(),
      new Promise((resolve) => setTimeout(resolve, 200)),
    ])

    shifts.value = employeeShifts
  } catch (error) {
    console.error('Failed to load shifts:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calculateDuration(startTime: string, endTime: string) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`
}

function getDaysUntil(date: string) {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  if (days < 14) return 'Next week'
  return `In ${Math.floor(days / 7)} weeks`
}

function getBadgeColor(date: string) {
  const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 1) return 'error'
  if (days <= 3) return 'warning'
  return 'success'
}
</script>
