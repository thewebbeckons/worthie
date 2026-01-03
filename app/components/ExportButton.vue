<script setup lang="ts">
const { accounts } = useNetWorth()

const exportToCsv = () => {
  const today = new Date().toISOString().slice(0, 10)
  
  // CSV header
  const header = 'date,name,bank,category,owner,balance'
  
  // CSV rows
  const rows = accounts.value.map(account => {
    // Escape fields that might contain commas or quotes
    const escapeCsvField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }
    
    return [
      today,
      escapeCsvField(account.name),
      escapeCsvField(account.bank),
      escapeCsvField(account.category),
      escapeCsvField(account.owner),
      account.latestBalance.toString()
    ].join(',')
  })
  
  const csvContent = [header, ...rows].join('\n')
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `account-balances-${today}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <UButton label="Export" @click="exportToCsv" icon="i-heroicons-arrow-down-tray" variant="outline" />
</template>
