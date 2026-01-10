/**
 * Composable for currency formatting utilities
 */
export const useCurrencyFormatter = () => {
  /**
   * Format a number as currency (full format)
   * @param value - Number to format
   * @returns Formatted currency string (e.g., "$1,234.56")
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  /**
   * Format a number as compact currency (e.g., "$1.2K")
   * @param value - Number to format
   * @returns Formatted compact currency string
   */
  const formatCompactCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  }

  return {
    formatCurrency,
    formatCompactCurrency
  }
}
