<template>
  <NuxtLayout name="dashboard">
    <UDashboardPanel>
      <UDashboardNavbar title="Shifts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" label="Add Shift" variant="outline" color="primary" />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent class="p-4 overflow-y-auto">
        <ShiftsCalendar />
      </UDashboardPanelContent>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  role: 'admin',
})
</script>
