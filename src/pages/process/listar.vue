<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/processo" title="Processos" :fields="[{ key: 'name', label: 'Nome' }, { key: 'description', label: 'Descrição' }]" />
</template>