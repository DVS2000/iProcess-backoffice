<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/form" title="Formulários" :fields="[{ key: 'title', label: 'Nome', required: true }, { key: 'description', label: 'Descrição' }, { key: 'createdAt', label: 'Criado em' }]" />
</template>
