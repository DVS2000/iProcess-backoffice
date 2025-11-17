<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/workflow" title="Workflows" :fields="[{ key: 'name', label: 'Nome', required: true }, { key: 'version', label: 'Versão', type: 'number' }]" />
</template>