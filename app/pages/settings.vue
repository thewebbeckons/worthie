<script setup lang="ts">
import { useDatabase } from '~/composables/useDatabase'

definePageMeta({
  title: 'Settings'
})

const { 
  profile, 
  updateProfile, 
  exportDatabase, 
  importDatabase, 
  resetDatabase,
  isReady 
} = useDatabase()

const toast = useToast()

// Color options (Nuxt UI semantic colors)
const colorOptions = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'] as const
type ColorOption = typeof colorOptions[number]

// Profile form state
const userName = ref('')
const userColor = ref<ColorOption>('primary')
const spouseName = ref('')
const spouseColor = ref<ColorOption>('secondary')
const isEditingProfile = ref(false)

// Initialize form from profile when loaded
watch(profile, (newProfile) => {
  if (newProfile) {
    userName.value = newProfile.userName || ''
    userColor.value = (newProfile.userColor as ColorOption) || 'primary'
    spouseName.value = newProfile.spouseName || ''
    spouseColor.value = (newProfile.spouseColor as ColorOption) || 'secondary'
  }
}, { immediate: true })

const hasProfile = computed(() => !!profile.value?.userName)
const hasSpouse = computed(() => !!profile.value?.spouseName)

const onSaveProfile = async () => {
  try {
    await updateProfile({
      userName: userName.value || undefined,
      userColor: userColor.value,
      spouseName: spouseName.value || undefined,
      spouseColor: spouseColor.value
    })
    isEditingProfile.value = false
    toast.add({ title: 'Profile saved successfully', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Failed to save profile', color: 'error', description: String(error) })
  }
}

// Data Management
const onExport = async () => {
  try {
    const data = await exportDatabase()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `networth-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ title: 'Database exported successfully', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Export failed', color: 'error', description: String(error) })
  }
}

const onImportClick = () => {
  // Create a hidden file input and trigger it
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    if (!confirm('This will REPLACE ALL existing data. Are you sure you want to proceed?')) {
      return
    }

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      await importDatabase(json)
      toast.add({ title: 'Database imported successfully', color: 'success' })
    } catch (error) {
      toast.add({ title: 'Import failed', color: 'error', description: String(error) })
    }
  }
  
  input.click()
}

// Danger Zone
const isResetModalOpen = ref(false)
const resetConfirmText = ref('')
const onResetApp = async () => {
  await resetDatabase()
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Settings</h1>
      <p class="text-muted-foreground mt-2">Manage your profile and application settings.</p>
    </div>

    <div v-if="!isReady" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl" />
    </div>

    <ClientOnly v-else>
      <div class="space-y-8">
        <!-- Profile Section -->
        <UCard variant="soft">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold">Profile</h2>
                <p class="text-sm text-muted-foreground">Set your name and optionally add a spouse/partner.</p>
              </div>
              <UButton
                v-if="!isEditingProfile"
                icon="i-lucide-pencil"
                :label="hasProfile ? 'Edit' : 'Set up'"
                @click="isEditingProfile = true"
              />
            </div>
          </template>

          <div v-if="!isEditingProfile" class="space-y-4">
            <!-- Show current profile -->
            <div class="flex items-center gap-4">
              <OwnerBadge
                :name="profile?.userName || 'Me'"
                :color="profile?.userColor || 'primary'"
                size="md"
              />
              <div class="flex-1">
                <p class="font-medium">{{ profile?.userName || 'Your Name' }}</p>
                <p class="text-sm text-muted-foreground">{{ hasProfile ? 'Owner' : 'Not configured yet' }}</p>
              </div>
            </div>
            
            <div v-if="hasSpouse" class="flex items-center gap-4">
              <OwnerBadge
                :name="profile?.spouseName || 'Spouse'"
                :color="profile?.spouseColor || 'secondary'"
                size="md"
              />
              <div class="flex-1">
                <p class="font-medium">{{ profile?.spouseName }}</p>
                <p class="text-sm text-muted-foreground">Spouse/Partner</p>
              </div>
            </div>

            <div v-if="!hasProfile" class="py-4 text-center">
              <p class="text-sm text-muted-foreground italic">Add your name to personalize account ownership.</p>
            </div>
          </div>

          <!-- Edit form -->
          <div v-else class="space-y-6">
            <!-- Your Profile -->
            <div class="space-y-4">
              <h3 class="font-medium">Your Profile</h3>
              
              <UFormField label="Your Name">
                <UInput v-model="userName" placeholder="Enter your name" />
              </UFormField>
              
              <UFormField label="Your Color">
                <div class="flex items-center gap-4">
                  <OwnerBadge :name="userName || 'You'" :color="userColor" size="lg" />
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="color in colorOptions"
                      :key="color"
                      type="button"
                      class="w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background"
                      :class="[
                        `bg-${color}`,
                        userColor === color ? 'ring-2 ring-current scale-110' : 'hover:scale-105'
                      ]"
                      @click="userColor = color"
                    />
                  </div>
                </div>
              </UFormField>
            </div>

            <UDivider />

            <!-- Spouse/Partner -->
            <div class="space-y-4">
              <h3 class="font-medium">Spouse/Partner (Optional)</h3>
              <p class="text-sm text-muted-foreground">Add a spouse or partner to enable joint and individual account ownership.</p>
              
              <UFormField label="Spouse/Partner Name">
                <UInput v-model="spouseName" placeholder="Enter spouse/partner name" />
              </UFormField>
              
              <UFormField v-if="spouseName" label="Spouse/Partner Color">
                <div class="flex items-center gap-4">
                  <OwnerBadge :name="spouseName" :color="spouseColor" size="lg" />
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="color in colorOptions"
                      :key="color"
                      type="button"
                      class="w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background"
                      :class="[
                        `bg-${color}`,
                        spouseColor === color ? 'ring-2 ring-current scale-110' : 'hover:scale-105'
                      ]"
                      @click="spouseColor = color"
                    />
                  </div>
                </div>
              </UFormField>
            </div>

            <!-- Action buttons -->
            <div class="flex justify-end gap-2 pt-4">
              <UButton label="Cancel" variant="ghost" @click="isEditingProfile = false" />
              <UButton label="Save Profile" @click="onSaveProfile" />
            </div>
          </div>
        </UCard>

        <!-- Data Management Section -->
        <UCard variant="soft">
          <template #header>
            <h2 class="text-xl font-semibold">Data Management</h2>
            <p class="text-sm text-muted-foreground">Export or import your financial data via JSON files.</p>
          </template>

          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
              <h3 class="font-medium mb-1">Export Data</h3>
              <p class="text-sm text-muted-foreground mb-3">Download a backup of all your accounts, balances, and snapshots.</p>
              <UButton
                icon="i-lucide-download"
                label="Export to JSON"
                block
                @click="onExport"
              />
            </div>

            <div class="flex-1 min-w-[200px]">
              <h3 class="font-medium mb-1">Import Data</h3>
              <p class="text-sm text-muted-foreground mb-3">Restore from a JSON backup. This will replace all current data.</p>
              <UButton
                icon="i-lucide-upload"
                label="Import from JSON"
                variant="outline"
                block
                @click="onImportClick"
              />
            </div>
          </div>
        </UCard>

        <!-- Danger Zone Section -->
        <UPageCard variant="soft" highlight highlightColor="error" :ui="{ root: 'bg-error/5 dark:bg-error/5' }">
          <template #header>
            <h2 class="text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
            <p class="text-sm text-muted-foreground">Irreversible actions that affect your data.</p>
          </template>

          <template #body>
            <div>
              <h3 class="font-medium mb-1">Reset Application</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Permanently delete all accounts, history, and settings from this browser. This cannot be undone.
              </p>
              <UButton
                color="error"
                label="Reset All Data"
                @click="isResetModalOpen = true"
              />
            </div>
          </template>
        </UPageCard>
      </div>

      <!-- Reset Confirmation Modal -->
      <UModal v-model:open="isResetModalOpen" title="Reset Application?">
        <template #body>
          <UAlert
            icon="i-lucide-alert-triangle"
            color="error"
            variant="subtle"
            title="Warning: Irreversible Action"
            description="All your financial data, accounts, and history will be permanently deleted from this browser. Please ensure you have an export if you wish to keep this data."
            class="mb-4"
          />
          <p>Type <strong>RESET</strong> below to confirm.</p>
          <div class="mt-4">
            <UInput v-model="resetConfirmText" placeholder="RESET" />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="isResetModalOpen = false" />
            <UButton
              label="Delete Everything"
              color="error"
              :disabled="resetConfirmText !== 'RESET'"
              @click="onResetApp"
            />
          </div>
        </template>
      </UModal>
    </ClientOnly>
  </UContainer>
</template>
