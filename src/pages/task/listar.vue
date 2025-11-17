<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/task" title="Tarefas" :fields="[{ key: 'title', label: 'Título' }, { key: 'dueDate', label: 'Vencimento', type: 'date' }]" />
</template>