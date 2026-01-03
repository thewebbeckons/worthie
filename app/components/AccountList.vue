<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { CalendarDate, type DateValue } from '@internationalized/date'

const { accounts, updateBalance, deleteAccount } = useNetWorth()

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'bank', header: 'Bank' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'owner', header: 'Owner' },
  { 
    accessorKey: 'balance', 
    header: ({ column }: any) => {
      const isSorted = column.getIsSorted()
      return h(resolveComponent('UButton'), {
        color: 'neutral',
        variant: 'ghost',
        label: 'Current Balance',
        icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  { id: 'actions' }
]

const sorting = ref([])

// Filter state
const searchInput = useTemplateRef('searchInput')
const searchQuery = ref('')
const categoryFilter = ref<string[]>([])
const ownerFilter = ref<string[]>([])
const bankFilter = ref<string[]>([])

// Keyboard shortcut to focus search
defineShortcuts({
  '/': () => {
    searchInput.value?.inputRef?.focus()
  }
})

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

// Unique filter options
const categoryOptions = computed(() => {
  const unique = [...new Set(items.value.map(i => i.category))].sort()
  return unique.map(c => ({ label: c, value: c }))
})

const ownerOptions = computed(() => {
  const unique = [...new Set(items.value.map(i => i.owner))].sort()
  return unique.map(o => ({ label: o, value: o }))
})

const bankOptions = computed(() => {
  const unique = [...new Set(items.value.map(i => i.bank))].sort()
  return unique.map(b => ({ label: b, value: b }))
})

// Apply filters
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

// State for updating balance
const isUpdateModalOpen = ref(false)
const selectedAccount = ref<any>(null)
const newBalanceValue = ref(0)
const today = new Date()
const newBalanceDate = ref<DateValue>(new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())) as any
const inputDateRef = useTemplateRef('inputDate')

const openUpdateModal = (row: any) => {
  selectedAccount.value = row
  newBalanceValue.value = row.balance
  isUpdateModalOpen.value = true
}

const saveBalanceUpdate = async () => {
  if (selectedAccount.value) {
    const dateStr = `${newBalanceDate.value.year}-${String(newBalanceDate.value.month).padStart(2, '0')}-${String(newBalanceDate.value.day).padStart(2, '0')}`
    await updateBalance(selectedAccount.value.id, newBalanceValue.value, dateStr)
    isUpdateModalOpen.value = false
  }
}

// State for editing account
const isEditModalOpen = ref(false)
const accountToEdit = ref<any>(null)

const openEditModal = (row: any) => {
  accountToEdit.value = {
    id: row.id,
    name: row.name,
    bank: row.bank,
    category: row.category,
    owner: row.owner,
    type: row.type,
    latestBalance: row.balance
  }
  isEditModalOpen.value = true
}

// State for delete confirmation
const isDeleteModalOpen = ref(false)
const accountToDelete = ref<any>(null)

const openDeleteModal = (row: any) => {
  accountToDelete.value = row
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (accountToDelete.value) {
    await deleteAccount(accountToDelete.value.id)
    isDeleteModalOpen.value = false
    accountToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center gap-4">
      <UInput
        ref="searchInput"
        v-model="searchQuery"
        placeholder="Search by name or bank..."
        icon="i-lucide-search"
        clear
        class="w-64"
      >
        <template #trailing>
          <UKbd value="/" />
        </template>
      </UInput>
      <div class="flex-1" />
      <div class="flex flex-wrap gap-4">
      <USelectMenu
        v-if="categoryOptions.length > 1"
        v-model="categoryFilter"
        :items="categoryOptions"
        value-key="value"
        placeholder="All Categories"
        multiple
        class="w-48"
      />
      <USelectMenu
        v-if="ownerOptions.length > 1"
        v-model="ownerFilter"
        :items="ownerOptions"
        value-key="value"
        placeholder="All Owners"
        multiple
        class="w-48"
      />
      <USelectMenu
        v-if="bankOptions.length > 1"
        v-model="bankFilter"
        :items="bankOptions"
        value-key="value"
        placeholder="All Banks"
        multiple
        class="w-48"
      />
      </div>
    </div>

    <UTable v-model:sorting="sorting" :columns="columns" :data="filteredItems">
      <template #owner-cell="{ row }">
        <div class="flex items-center gap-2">
          <OwnerBadge :name="row.original.owner" :color="row.original.ownerColor" size="xs" />
        </div>
      </template>

      <template #balance-cell="{ row }">
        <span :class="row.original.balance < 0 ? 'text-error' : 'text-primary'">
          {{ formatCurrency(row.original.balance) }}
        </span>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-2">
          <UTooltip text="Update Balance">
            <UButton 
              icon="i-lucide-circle-dollar-sign" 
              color="success" 
              variant="ghost" 
              class="cursor-pointer"
              @click="openUpdateModal(row.original)"
            />
          </UTooltip>
          <UTooltip text="Edit Account">
            <UButton 
              icon="i-lucide-pencil" 
              color="primary" 
              variant="ghost" 
              class="cursor-pointer"
              @click="openEditModal(row.original)"
            />
          </UTooltip>
          <UTooltip text="View History">
            <UButton 
              icon="i-lucide-chart-no-axes-combined"  
              color="neutral" 
              variant="ghost" 
              :to="`/accounts/${row.original.id}`"
            />
          </UTooltip>
          <UTooltip text="Delete Account">
            <UButton 
              icon="i-lucide-trash-2" 
              color="error" 
              variant="ghost" 
              class="cursor-pointer"
              @click="openDeleteModal(row.original)"
            />
          </UTooltip>
        </div>
      </template>
    </UTable>

    <!-- Update Balance Modal -->
    <UModal v-model:open="isUpdateModalOpen">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-bold mb-4">Update Balance for {{ selectedAccount?.name }}</h3>
          
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
              <UButton label="Cancel" color="neutral" variant="ghost" @click="isUpdateModalOpen = false" />
              <UButton label="Save" color="primary" @click="saveBalanceUpdate" />
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit Account Modal -->
    <UModal v-model:open="isEditModalOpen" title="Edit Account">
      <template #body>
        <EditAccountForm 
          v-if="accountToEdit" 
          :account="accountToEdit" 
          @close="isEditModalOpen = false" 
          @saved="isEditModalOpen = false" 
        />
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-bold mb-4">Delete Account</h3>
          <p class="mb-4">Are you sure you want to delete <strong>{{ accountToDelete?.name }}</strong>? This action cannot be undone and will remove all balance history for this account.</p>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="isDeleteModalOpen = false" />
            <UButton label="Delete" color="error" @click="confirmDelete" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
