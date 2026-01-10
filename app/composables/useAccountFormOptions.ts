import type { OwnerType } from '~/types/db'

/**
 * Composable for generating form options used in account forms
 */
export const useAccountFormOptions = () => {
  const { profile, categories: dbCategories } = useDatabase()

  /**
   * Get category options from the database
   * @returns Array of category name strings
   */
  const categoryOptions = computed(() => dbCategories.value.map(c => c.name))

  /**
   * Get owner options based on profile configuration
   * @returns Array of owner option objects with value and label
   */
  const ownerOptions = computed(() => {
    const options: { value: OwnerType; label: string }[] = [
      { value: 'me', label: profile.value?.userName || 'Me' }
    ]

    if (profile.value?.spouseName) {
      options.push({ value: 'spouse', label: profile.value.spouseName })
      options.push({ value: 'joint', label: 'Joint' })
    }

    return options
  })

  /**
   * Map owner display name back to OwnerType
   * @param ownerName - Display name of owner
   * @returns OwnerType enum value
   */
  const getOwnerType = (ownerName: string): OwnerType => {
    if (ownerName === 'Joint') return 'joint'
    if (profile.value?.spouseName && ownerName === profile.value.spouseName) return 'spouse'
    return 'me'
  }

  return {
    categoryOptions,
    ownerOptions,
    getOwnerType
  }
}
