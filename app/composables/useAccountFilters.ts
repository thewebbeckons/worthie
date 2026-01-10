/**
 * Composable for managing account filtering logic
 * Provides filter state and computed filter options
 */
export const useAccountFilters = (accounts: ComputedRef<any[]> | Ref<any[]>) => {
  // Filter state
  const searchQuery = ref('')
  const categoryFilter = ref<string[]>([])
  const ownerFilter = ref<string[]>([])
  const bankFilter = ref<string[]>([])

  /**
   * Transform accounts to items format
   */
  const items = computed(() => {
    return accounts.value.map(acc => ({
      id: acc.id,
      name: acc.name,
      bank: acc.bank,
      category: acc.category,
      owner: acc.owner,
      ownerColor: acc.ownerColor,
      type: acc.type,
      balance: acc.latestBalance
    }))
  })

  /**
   * Apply all filters to items
   */
  const filteredItems = computed(() => {
    return items.value.filter(item => {
      // Search filter (name or bank)
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(query)
        const matchesBank = item.bank.toLowerCase().includes(query)
        if (!matchesName && !matchesBank) return false
      }
      // Dropdown filters
      if (categoryFilter.value.length > 0 && !categoryFilter.value.includes(item.category)) return false
      if (ownerFilter.value.length > 0 && !ownerFilter.value.includes(item.owner)) return false
      if (bankFilter.value.length > 0 && !bankFilter.value.includes(item.bank)) return false
      return true
    })
  })

  /**
   * Compute unique category options
   */
  const categoryOptions = computed(() => {
    const unique = [...new Set(items.value.map(i => i.category))].sort()
    return unique.map(c => ({ label: c, value: c }))
  })

  /**
   * Compute unique owner options
   */
  const ownerOptions = computed(() => {
    const unique = [...new Set(items.value.map(i => i.owner))].sort()
    return unique.map(o => ({ label: o, value: o }))
  })

  /**
   * Compute unique bank options
   */
  const bankOptions = computed(() => {
    const unique = [...new Set(items.value.map(i => i.bank))].sort()
    return unique.map(b => ({ label: b, value: b }))
  })

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    searchQuery.value = ''
    categoryFilter.value = []
    ownerFilter.value = []
    bankFilter.value = []
  }

  return {
    // Filter state
    searchQuery,
    categoryFilter,
    ownerFilter,
    bankFilter,
    // Computed values
    items,
    filteredItems,
    categoryOptions,
    ownerOptions,
    bankOptions,
    // Methods
    resetFilters
  }
}
