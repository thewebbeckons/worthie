<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'

const { accounts, updateBalance, deleteAccount } = useNetWorth()

// Props for filter values (controlled by parent)
const props = defineProps<{
  searchQuery?: string
  categoryFilter?: string[]
  ownerFilter?: string[]
  bankFilter?: string[]
}>()

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

// Apply filters from props
const filteredItems = computed(() => {
  return items.value.filter(item => {
    // Search filter (name or bank)
    if (props.searchQuery) {
      const query = props.searchQuery.toLowerCase()
      const matchesName = item.name.toLowerCase().includes(query)
      const matchesBank = item.bank.toLowerCase().includes(query)
      if (!matchesName && !matchesBank) return false
    }
    // Dropdown filters
    if (props.categoryFilter && props.categoryFilter.length > 0 && !props.categoryFilter.includes(item.category)) return false
    if (props.ownerFilter && props.ownerFilter.length > 0 && !props.ownerFilter.includes(item.owner)) return false
    if (props.bankFilter && props.bankFilter.length > 0 && !props.bankFilter.includes(item.bank)) return false
    return true
  })
})

// Metrics computed properties
const totalAccountsCount = computed(() => items.value.length)
const filteredAccountsCount = computed(() => filteredItems.value.length)
const filteredAccountsTotal = computed(() => {
  return filteredItems.value.reduce((sum, item) => {
    // Subtract liabilities from the total
    if (item.type === 'liability') {
      return sum - item.balance
    }
    return sum + item.balance
  }, 0)
})

// Modal state management using new composable
const updateBalanceModal = useModalState<any>()
const editAccountModal = useModalState<any>()
const deleteAccountModal = useModalState<any>()

// Update balance state
const newBalanceValue = ref(0)
const today = new Date()
const newBalanceDate = ref<DateValue>(new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())) as any
const inputDateRef = useTemplateRef('inputDate')

const handleUpdateBalance = (account: any) => {
  newBalanceValue.value = account.balance
  updateBalanceModal.open(account)
}

const saveBalanceUpdate = async () => {
  if (updateBalanceModal.data.value) {
    const dateStr = `${newBalanceDate.value.year}-${String(newBalanceDate.value.month).padStart(2, '0')}-${String(newBalanceDate.value.day).padStart(2, '0')}`
    await updateBalance(updateBalanceModal.data.value.id, newBalanceValue.value, dateStr)
    updateBalanceModal.close()
  }
}

const handleEditAccount = (account: any) => {
  const accountData = {
    id: account.id,
    name: account.name,
    bank: account.bank,
    category: account.category,
    owner: account.owner,
    type: account.type,
    latestBalance: account.balance
  }
  editAccountModal.open(accountData)
}

const handleDeleteAccount = (account: any) => {
  deleteAccountModal.open(account)
}

const confirmDelete = async () => {
  if (deleteAccountModal.data.value) {
    await deleteAccount(deleteAccountModal.data.value.id)
    deleteAccountModal.close()
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Metrics Bar -->
    <AccountsMetricsBar
      :total-count="totalAccountsCount"
      :filtered-count="filteredAccountsCount"
      :filtered-total="filteredAccountsTotal"
    />

    <!-- Accounts Table -->
    <AccountsTable
      :items="filteredItems"
      @update-balance="handleUpdateBalance"
      @edit-account="handleEditAccount"
      @delete-account="handleDeleteAccount"
    />

    <!-- Update Balance Modal -->
    <UModal v-model:open="updateBalanceModal.isOpen.value">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-bold mb-4">Update Balance for {{ updateBalanceModal.data.value?.name }}</h3>
          
          <div class="space-y-4">
            <UFormField label="Date">
              <UInputDate ref="inputDate" v-model="newBalanceDate">
                <template #trailing>
                  <UPopover>
                    <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar" aria-label="Select a date" class="px-0" />
                    <template #content>
                      <UCalendar v-model="newBalanceDate" class="p-2" />
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>
            
            <UFormField label="New Balance">
              <UInputNumber v-model="newBalanceValue" :format-options="{ style: 'currency', currency: 'USD' }" :step="0.01" />
            </UFormField>

            <div class="flex justify-end gap-2 mt-4">
              <UButton label="Cancel" color="neutral" variant="ghost" @click="updateBalanceModal.close()" />
              <UButton label="Save" color="primary" @click="saveBalanceUpdate" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit Account Modal -->
    <UModal v-model:open="editAccountModal.isOpen.value" title="Edit Account">
      <template #body>
        <EditAccountForm
          v-if="editAccountModal.data.value"
          :account="editAccountModal.data.value"
          @close="editAccountModal.close()"
          @saved="editAccountModal.close()"
        />
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteAccountModal.isOpen.value">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-bold mb-4">Delete Account</h3>
          <p class="mb-4">Are you sure you want to delete <strong>{{ deleteAccountModal.data.value?.name }}</strong>? This action cannot be undone and will remove all balance history for this account.</p>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="deleteAccountModal.close()" />
            <UButton label="Delete" color="error" @click="confirmDelete" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
