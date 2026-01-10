/**
 * Composable for managing modal state
 * Provides a reusable pattern for opening/closing modals with optional data
 */
export const useModalState = <T = unknown>() => {
  const isOpen = ref(false)
  const data = ref<T | null>(null) as Ref<T | null>

  /**
   * Open the modal with optional data
   * @param modalData - Optional data to pass to the modal
   */
  const open = (modalData?: T) => {
    if (modalData !== undefined) {
      data.value = modalData
    }
    isOpen.value = true
  }

  /**
   * Close the modal and clear data
   */
  const close = () => {
    isOpen.value = false
    data.value = null
  }

  /**
   * Toggle the modal state
   */
  const toggle = () => {
    isOpen.value = !isOpen.value
    if (!isOpen.value) {
      data.value = null
    }
  }

  return {
    isOpen,
    data,
    open,
    close,
    toggle
  }
}
