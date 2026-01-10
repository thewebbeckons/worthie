/**
 * Composable for creating chart tooltip templates
 */
export const useChartTooltip = () => {
  /**
   * Create a tooltip HTML template for single-series charts
   * @param date - Formatted date string
   * @param label - Data series label
   * @param value - Formatted value string
   * @param color - Dot color
   * @returns HTML string for tooltip
   */
  const createTooltip = (
    date: string,
    label: string,
    value: string,
    color: string
  ): string => {
    return `
      <div class="chart-tooltip">
        <div class="chart-tooltip-header">${date}</div>
        <div class="chart-tooltip-row">
          <span class="chart-tooltip-dot" style="background: ${color}"></span>
          <span class="chart-tooltip-label">${label}</span>
          <span class="chart-tooltip-value">${value}</span>
        </div>
      </div>
    `
  }

  /**
   * Create a tooltip HTML template for multi-series charts
   * @param date - Formatted date string
   * @param series - Array of { label, value, color } objects
   * @returns HTML string for tooltip
   */
  const createMultiSeriesTooltip = (
    date: string,
    series: Array<{ label: string; value: string; color: string }>
  ): string => {
    const rows = series
      .map(
        (s) => `
        <div class="chart-tooltip-row">
          <span class="chart-tooltip-dot" style="background: ${s.color}"></span>
          <span class="chart-tooltip-label">${s.label}</span>
          <span class="chart-tooltip-value">${s.value}</span>
        </div>
      `
      )
      .join('')

    return `
      <div class="chart-tooltip">
        <div class="chart-tooltip-header">${date}</div>
        ${rows}
      </div>
    `
  }

  return {
    createTooltip,
    createMultiSeriesTooltip
  }
}
