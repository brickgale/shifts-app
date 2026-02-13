<template>
  <NuxtLayout name="dashboard">
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Employee Dashboard</h1>
      </div>
      <p>
        Welcome to the employee dashboard! Here you can view your shifts and manage your schedule.
      </p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  role: 'employee',
})
</script>
