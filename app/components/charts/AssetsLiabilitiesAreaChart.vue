<script setup lang="ts">
import { VisXYContainer, VisArea, VisAxis, VisCrosshair, VisLine } from '@unovis/vue'
import { CurveType } from '@unovis/ts'

interface Snapshot {
  month: string
  netWorth: number
  assetsTotal: number
  liabilitiesTotal: number
}

const props = defineProps<{
  snapshots: Snapshot[]
  startDate?: Date | null
  height?: number
}>()

const { parseLocalDate } = useLocalDateParsing()
const { formatCompactCurrency } = useCurrencyFormatter()
const { createMultiSeriesTooltip } = useChartTooltip()

// Transform snapshots for the chart
const chartData = computed(() => {
  let snapshots = props.snapshots

  // Filter by start date if provided
  if (props.startDate) {
    const startMonth = `${props.startDate.getFullYear()}-${String(props.startDate.getMonth() + 1).padStart(2, '0')}`
    snapshots = snapshots.filter(s => s.month >= startMonth)
  }

  return snapshots.map((s, index) => ({
    x: index,
    assets: s.assetsTotal,
    liabilities: s.liabilitiesTotal,
    netWorth: s.netWorth,
    month: s.month,
    formattedDate: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(parseLocalDate(`${s.month}-01`))
  }))
})

// Accessors
const x = (d: typeof chartData.value[0]) => d.x
const yAssets = (d: typeof chartData.value[0]) => d.assets
const yLiabilities = (d: typeof chartData.value[0]) => d.liabilities

// Colors
const assetsColor = '#22c55e'
const liabilitiesColor = '#fca5a5'  // Light red (red-300)

// Formatters
const xTickFormat = (tick: number) => {
  const d = chartData.value[Math.round(tick)]
  return d?.formattedDate ?? ''
}

// Tooltip template
const tooltipTemplate = (d: typeof chartData.value[0]) => {
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(parseLocalDate(`${d.month}-01`))
  return createMultiSeriesTooltip(month, [
    { label: 'Assets', value: formatCompactCurrency(d.assets), color: assetsColor },
    { label: 'Liabilities', value: formatCompactCurrency(d.liabilities), color: liabilitiesColor }
  ])
}

const chartHeight = computed(() => props.height ?? 180)
</script>

<template>
  <div v-if="chartData.length > 1" class="w-full" :style="{ height: `${chartHeight}px` }">
    <VisXYContainer :data="chartData" :height="chartHeight" :margin="{ top: 5, right: 10, bottom: 25, left: 10 }">
      <!-- Assets Area (behind) -->
      <VisArea
        :x="x"
        :y="yAssets"
        :color="assetsColor"
        :opacity="0.4"
        :curve-type="CurveType.MonotoneX"
      />
      <!-- Liabilities Area (front) -->
      <VisArea
        :x="x"
        :y="yLiabilities"
        :color="liabilitiesColor"
        :opacity="0.9"
        :curve-type="CurveType.MonotoneX"
      />
      <!-- Assets Line -->
      <VisLine
        :x="x"
        :y="yAssets"
        :color="assetsColor"
        :line-width="2"
        :curve-type="CurveType.MonotoneX"
      />
      <!-- Liabilities Line -->
      <VisLine
        :x="x"
        :y="yLiabilities"
        :color="liabilitiesColor"
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
      <VisCrosshair :template="tooltipTemplate" />
    </VisXYContainer>
  </div>
  <div v-else class="flex items-center justify-center text-neutral-400 text-sm py-8">
    Not enough data to display chart
  </div>
</template>

<style scoped>
/* Axis and tooltip styling */
:deep(.unovis-xy-container) {
  --vis-axis-tick-color: rgb(var(--color-neutral-400));
  --vis-axis-label-color: rgb(var(--color-neutral-500));
  --vis-crosshair-circle-stroke-color: white;
  --vis-crosshair-circle-stroke-width: 2px;
  /* Reset default tooltip container to be invisible */
  --vis-tooltip-background-color: transparent;
  --vis-tooltip-border-color: transparent;
  --vis-tooltip-shadow-color: transparent;
  --vis-tooltip-padding: 0;
}

:deep(.unovis-axis-tick text) {
  font-size: 11px;
  fill: rgb(var(--color-neutral-500));
}
</style>
