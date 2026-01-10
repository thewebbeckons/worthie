<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { OwnerType } from '~/types/db'

const props = defineProps<{
  account: {
    id: string
    name: string
    bank: string
    category: string
    owner: string
    type: 'asset' | 'liability'
    latestBalance: number
    notes?: string
  }
}>()

const emit = defineEmits(['close', 'saved'])

const { updateAccount } = useNetWorth()
const { categoryOptions, ownerOptions, getOwnerType } = useAccountFormOptions()

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  bank: z.string().min(1, 'Bank is required'),
  category: z.string().min(1, 'Category is required'),
  owner: z.enum(['me', 'spouse', 'joint'] as const)
})

type Schema = z.output<typeof schema>

// Separate notes state (not part of zod schema since it's optional HTML content)
const notes = ref(props.account.notes || '')

// Initialize state with account data
const state = reactive({
  name: props.account.name,
  bank: props.account.bank,
  category: props.account.category,
  owner: getOwnerType(props.account.owner)
})

// Watch for account changes to update form
watch(() => props.account, (newAccount) => {
  state.name = newAccount.name
  state.bank = newAccount.bank
  state.category = newAccount.category
  state.owner = getOwnerType(newAccount.owner)
  notes.value = newAccount.notes || ''
}, { deep: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await updateAccount(props.account.id, {
    ...event.data,
    notes: notes.value || undefined
  })
  emit('saved')
  emit('close')
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Account Name" name="name">
      <UInput v-model="state.name" placeholder="e.g. Chase Checking" />
    </UFormField>

    <UFormField label="Bank" name="bank">
      <UInput v-model="state.bank" placeholder="e.g. Chase, Wells Fargo" />
    </UFormField>

    <UFormField label="Category" name="category">
      <USelect v-model="state.category" :items="categoryOptions" />
    </UFormField>

    <UFormField label="Owner" name="owner">
      <USelect 
        v-model="state.owner" 
        :items="ownerOptions"
        value-key="value"
        label-key="label"
      />
    </UFormField>

    <UFormField label="Notes" name="notes" hint="Optional">
      <UEditor 
        v-model="notes"
        content-type="html"
        placeholder="Add notes about this account (e.g. GIC matures Sept. 28th)"
        :ui="{ 
          root: 'border border-default rounded-md',
          content: 'py-4',
          base: 'min-h-[120px]'
        }"
      />
    </UFormField>

    <div class="flex justify-end gap-2">
      <UButton label="Cancel" color="neutral" variant="ghost" @click="$emit('close')" />
      <UButton type="submit" label="Save Changes" color="primary" />
    </div>
  </UForm>
</template>
