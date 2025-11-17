<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/form" title="Adicionar Formulário" :fields="[{ key: 'name', label: 'Nome', required: true }, { key: 'description', label: 'Descrição' }]" />
</template>