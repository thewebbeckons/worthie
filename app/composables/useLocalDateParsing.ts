/**
 * Composable for parsing date strings as local dates to avoid timezone offset issues
 */
export const useLocalDateParsing = () => {
  /**
   * Parse a date string (YYYY-MM-DD) as a local date
   * @param dateStr - Date string in format YYYY-MM-DD or YYYY-MM
   * @returns Date object in local timezone
   */
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year!, month! - 1, day || 1)
  }

  /**
   * Format a date string for display
   * @param dateStr - Date string in format YYYY-MM-DD
   * @param options - Intl.DateTimeFormat options
   * @returns Formatted date string
   */
  const formatLocalDate = (
    dateStr: string,
    options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  ): string => {
    const date = parseLocalDate(dateStr)
    return new Intl.DateTimeFormat('en-US', options).format(date)
  }

  return {
    parseLocalDate,
    formatLocalDate
  }
}
