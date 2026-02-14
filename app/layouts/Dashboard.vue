<template>
  <UDashboardGroup>
    <UDashboardSidebar
      id="default"
      v-model:open="sidebarOpen"
      collapsible
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="navigationLinks"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="bottomLinks"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UDropdownMenu
          :items="userMenuItems"
          :content="{ align: 'center', collisionPadding: 12 }"
          :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
        >
          <UButton
            :label="collapsed ? undefined : user?.name"
            :avatar="{
              src: `https://ui-avatars.com/api/?name=${user?.name}&background=random`,
              alt: user?.name,
            }"
            :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            class="data-[state=open]:bg-elevated"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const { user, logout } = useAuth()
const router = useRouter()

const sidebarOpen = ref(false)

const navigationLinks = computed<NavigationMenuItem[][]>(() => {
  const links: NavigationMenuItem[] = []

  if (user.value?.role === 'admin') {
    links.push(
      {
        label: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        to: '/admin',
        exact: true,
        onSelect: () => {
          sidebarOpen.value = false
        },
      },
      {
        label: 'Shifts',
        icon: 'i-lucide-calendar',
        to: '/admin/shifts',
        onSelect: () => {
          sidebarOpen.value = false
        },
      },
      {
        label: 'Employees',
        icon: 'i-lucide-users',
        to: '/admin/employees',
        onSelect: () => {
          sidebarOpen.value = false
        },
      }
    )
  } else if (user.value?.role === 'employee') {
    links.push(
      {
        label: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        to: '/employee',
        exact: true,
        onSelect: () => {
          sidebarOpen.value = false
        },
      },
      {
        label: 'My Shifts',
        icon: 'i-lucide-calendar',
        to: '/employee/shifts',
        onSelect: () => {
          sidebarOpen.value = false
        },
      }
    )
  }

  return [links]
})

const bottomLinks = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: user.value?.role === 'admin' ? '/admin/settings' : '/employee/settings',
      onSelect: () => {
        sidebarOpen.value = false
      },
    },
  ],
])

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value?.name || '',
      avatar: {
        src: `https://ui-avatars.com/api/?name=${user.value?.name}&background=random`,
        alt: user.value?.name,
      },
    },
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: user.value?.role === 'admin' ? '/admin/settings' : '/employee/settings',
    },
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await logout()
        router.push('/login')
      },
    },
  ],
])
</script>
