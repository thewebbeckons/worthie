<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { isOnline } = useNetworkStatus()

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/',
    active: route.path === '/'
  },
  {
    label: 'Accounts',
    icon: 'i-lucide-wallet',
    to: '/accounts',
    active: route.path.startsWith('/accounts')
  }
])
</script>

<template>
  <UHeader>
    <template #left>
      <div class="flex items-center gap-2 mr-4">
        <img src="/logo.png" alt="Worthie Logo" class="h-8 w-8 rounded-lg" />
        <span class="font-bold text-xl hidden sm:block">Worths</span>
      </div>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <!-- Offline indicator -->
      <UBadge
        v-if="!isOnline"
        color="warning"
        variant="subtle"
        size="sm"
        class="mr-2"
      >
        <UIcon name="i-lucide-wifi-off" class="mr-1" />
        Offline
      </UBadge>

      <UButton
        to="/settings"
        icon="i-lucide-user"
        aria-label="Settings"
        color="neutral"
        variant="ghost"
      />
      <UColorModeButton />
    </template>
    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
