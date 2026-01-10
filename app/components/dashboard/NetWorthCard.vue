<script setup lang="ts">
interface PeriodGrowth {
  growth: number
  percentage: number
}

const props = defineProps<{
  currentNetWorth: number
  totalAssets: number
  totalLiabilities: number
  periodGrowth: PeriodGrowth
  startDate?: Date | null
}>()

const { monthlySnapshots } = useNetWorth()
const { formatCurrency } = useCurrencyFormatter()
</script>

<template>
  <UCard class="md:w-1/2 relative overflow-hidden shadow-sm" variant="outline">
    <div class="relative flex flex-col h-full">
      <!-- Top Section: Net Worth + Growth Indicator -->
      <div class="mb-4">
        <div class="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Net Worth</div>
        <div class="text-3xl font-bold text-neutral-900 dark:text-white">
          {{ formatCurrency(currentNetWorth) }}
        </div>
        
        <!-- Growth Indicator (Below Net Worth) -->
        <div 
          v-if="periodGrowth.growth !== 0" 
          class="flex items-center gap-1.5 mt-1 text-sm font-medium"
          :class="periodGrowth.growth >= 0 ? 'text-green-500' : 'text-red-500'"
        >
          <UIcon 
            :name="periodGrowth.growth >= 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
            class="w-4 h-4" 
          />
          <span>{{ periodGrowth.growth >= 0 ? '+' : '' }}{{ formatCurrency(periodGrowth.growth) }}</span>
          <span class="opacity-70">({{ periodGrowth.growth >= 0 ? '+' : '' }}{{ periodGrowth.percentage.toFixed(1) }}%)</span>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="flex-1 mb-4">
        <ChartsAssetsLiabilitiesAreaChart :snapshots="monthlySnapshots" :start-date="startDate" :height="180" />
      </div>

      <!-- Bottom Section: Assets & Liabilities Side by Side -->
      <div class="flex gap-6 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <!-- Assets -->
        <div class="flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="w-2 h-2 rounded-full bg-green-500" />
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Assets</span>
          </div>
          <div class="text-lg font-semibold text-green-500">
            {{ formatCurrency(totalAssets) }}
          </div>
        </div>

        <!-- Liabilities -->
        <div class="flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="w-2 h-2 rounded-full bg-red-400" />
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Liabilities</span>
          </div>
          <div class="text-lg font-semibold text-red-400">
            {{ formatCurrency(totalLiabilities) }}
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
