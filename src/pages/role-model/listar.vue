<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/role-model" title="Modelos de Papel" :fields="[{ key: 'name', label: 'Nome', required: true }, { key: 'description', label: 'Descrição' }]" />
</template>