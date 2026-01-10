<script setup lang="ts">
import { h, resolveComponent } from 'vue'

interface AccountItem {
  id: string
  name: string
  bank: string
  category: string
  owner: string
  ownerColor?: string
  type: 'asset' | 'liability'
  balance: number
}

const props = defineProps<{
  items: AccountItem[]
}>()

const emit = defineEmits<{
  updateBalance: [account: AccountItem]
  editAccount: [account: AccountItem]
  deleteAccount: [account: AccountItem]
}>()

const { formatCurrency } = useCurrencyFormatter()

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
</script>

<template>
  <UTable v-model:sorting="sorting" :columns="columns" :data="items">
    <template #owner-cell="{ row }">
      <div class="flex items-center gap-2">
        <OwnerBadge :name="row.original.owner" :color="row.original.ownerColor" size="xs" />
      </div>
    </template>

    <template #balance-cell="{ row }">
      <span :class="(row.original.type === 'liability' && row.original.balance > 0) || (row.original.type !== 'liability' && row.original.balance < 0) ? 'text-error' : 'text-primary'">
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
            @click="emit('updateBalance', row.original)"
          />
        </UTooltip>
        <UTooltip text="Edit Account">
          <UButton
            icon="i-lucide-pencil"
            color="primary"
            variant="ghost"
            class="cursor-pointer"
            @click="emit('editAccount', row.original)"
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
            @click="emit('deleteAccount', row.original)"
          />
        </UTooltip>
      </div>
    </template>
  </UTable>
</template>
