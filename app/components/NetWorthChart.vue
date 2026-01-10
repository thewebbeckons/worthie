<script setup lang="ts">
import { VisXYContainer, VisArea, VisAxis, VisCrosshair, VisLine } from '@unovis/vue'
import { CurveType } from '@unovis/ts'

const props = defineProps<{
  startDate?: Date | null
}>()

const { getFilteredHistory } = useNetWorth()
const { parseLocalDate } = useLocalDateParsing()
const { formatCompactCurrency, formatCurrency } = useCurrencyFormatter()
const { createTooltip } = useChartTooltip()

// Transform data for Unovis
const data = computed(() => {
  const history = getFilteredHistory(props.startDate ?? null)
  return history.map((item, index) => ({
    x: index,
    y: item.value,
    date: item.date,
    formattedDate: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(parseLocalDate(item.date)),
    shortDate: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(parseLocalDate(item.date))
  }))
})

// Accessors
const x = (d: typeof data.value[0]) => d.x
const y = (d: typeof data.value[0]) => d.y

// Chart color
const color = '#3b82f6' // Blue

// Formatters
const xTickFormat = (tick: number) => {
  const d = data.value[Math.round(tick)]
  return d?.shortDate ?? ''
}

// Tooltip template
const tooltipTemplate = (d: typeof data.value[0]) => {
  return createTooltip(d.formattedDate, 'Net Worth', formatCurrency(d.y), color)
}
</script>

<template>
  <div class="w-full">
    <div v-if="data.length > 0" class="h-[300px]">
      <VisXYContainer :data="data" :height="300" :margin="{ top: 10, right: 10, bottom: 25, left: 50 }">
        <VisArea 
          :x="x" 
          :y="y" 
          :color="color"
          :opacity="0.3"
          :curve-type="CurveType.MonotoneX"
        />
        <VisLine 
          :x="x" 
          :y="y" 
          :color="color"
          :line-width="2"
          :curve-type="CurveType.MonotoneX"
        />
        <VisAxis 
          type="x" 
          :tick-format="xTickFormat"
          :num-ticks="6"
          :grid-line="false"
          :tick-line="false"
          :domain-line="false"
        />
        <VisAxis
          type="y"
          :tick-format="formatCompactCurrency"
          :num-ticks="4"
          :grid-line="true"
          :tick-line="false"
          :domain-line="false"
        />
        <VisCrosshair :template="tooltipTemplate" />
      </VisXYContainer>
    </div>
    <div v-else class="h-full flex items-center justify-center text-gray-500">
      No data available
    </div>
  </div>
</template>

<style scoped>
/* Axis styling */
:deep(.unovis-xy-container) {
  --vis-axis-tick-color: rgb(var(--color-neutral-400));
  --vis-axis-grid-color: rgb(var(--color-neutral-200));
  --vis-axis-label-color: rgb(var(--color-neutral-500));
}

:deep(.unovis-axis-tick text) {
  font-size: 11px;
  fill: rgb(var(--color-neutral-500));
}

/* Dark mode */
.dark :deep(.unovis-xy-container) {
  --vis-axis-grid-color: rgb(var(--color-neutral-700));
}
</style>
