<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/menu" title="Menus" :fields="[{ key: 'name', label: 'Nome', required: true }, { key: 'path', label: 'Path' }]" />
</template>