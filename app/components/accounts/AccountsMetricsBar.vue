<script setup lang="ts">
const props = defineProps<{
  totalCount: number
  filteredCount: number
  filteredTotal: number
}>()

const { formatCurrency } = useCurrencyFormatter()
</script>

<template>
  <div class="flex items-center justify-between text-sm">
    <span class="text-muted">
      Showing <span class="font-medium text-default">{{ filteredCount }}</span> out of <span class="font-medium text-default">{{ totalCount }}</span> accounts
    </span>
    <span class="font-medium">
      Accounts Total: <span :class="filteredTotal < 0 ? 'text-error' : 'text-primary'">{{ formatCurrency(filteredTotal) }}</span>
    </span>
  </div>
</template>
