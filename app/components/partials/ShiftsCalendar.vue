<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Shift Calendar</h3>
    </template>

    <div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <div>
        <UCalendar v-model="selectedDate" />
      </div>

      <div>
        <h4 class="text-sm font-semibold mb-4">Shifts for {{ formatDateHeader(selectedDate) }}</h4>

        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 2" :key="i" class="h-[102px] w-full" />
        </div>

        <div v-else-if="shiftsForDay.length > 0" class="space-y-3">
          <div
            v-for="shift in shiftsForDay"
            :key="shift.id"
            class="flex items-start justify-between p-4 rounded-lg border border-default bg-elevated/50"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-primary/10">
                <UIcon name="i-lucide-calendar" class="w-5 h-5 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ shift.name }}</p>
                <p class="text-sm text-muted">{{ shift.user.name }}</p>
                <div class="flex items-center gap-3 mt-1 text-sm text-muted">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-clock" class="w-4 h-4" />
                    {{ formatTime(shift.startTime) }} - {{ formatTime(shift.endTime) }}
                  </span>
                </div>
              </div>
            </div>
            <UBadge :color="getShiftStatus(shift.startTime)" variant="subtle">
              {{ getShiftLabel(shift.startTime) }}
            </UBadge>
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted">
          <UIcon name="i-lucide-calendar-x" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No shifts scheduled for this day</p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { today, getLocalTimeZone } from '@internationalized/date'
import { shiftsApi } from '~/api/shifts'
import type { ShiftWithUser } from '~/types/shifts'

const shiftsForDay = ref<ShiftWithUser[]>([])
const selectedDate = ref<CalendarDate>()
const loading = ref(false)

async function fetchShiftsForDate(date: CalendarDate) {
  loading.value = true
  try {
    // Format date as YYYY-MM-DD without timezone conversion
    const dateString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`

    // Ensure minimum loading time of 200ms for better UX
    const [shifts] = await Promise.all([
      shiftsApi.list(dateString),
      new Promise((resolve) => setTimeout(resolve, 200)),
    ])

    shiftsForDay.value = shifts
  } catch (error) {
    console.error('Failed to load shifts:', error)
    shiftsForDay.value = []
  } finally {
    loading.value = false
  }
}

watch(selectedDate, (newDate) => {
  if (newDate) {
    fetchShiftsForDate(newDate)
  }
})

onMounted(async () => {
  // Initialize calendar to today's date and fetch shifts for today
  const todayDate = today(getLocalTimeZone())
  selectedDate.value = todayDate
  await fetchShiftsForDate(todayDate)
})

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

function formatDateHeader(date: CalendarDate | undefined) {
  if (!date) return 'Select a date'
  const jsDate = new Date(date.year, date.month - 1, date.day)
  return jsDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
