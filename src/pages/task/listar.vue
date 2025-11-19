<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage 
    resource="/task" title="Tarefas" 
    :fields="[
      { key: 'title', label: 'Título' },
      { key: 'assignedTo.name', label: 'Atribuído a' },
      {
        key: 'completed',
        label: 'Concluída'
      },
      { key: 'createdAt', label: 'Criado em', type: 'date' },
      { key: 'dueDate', label: 'Vencimento', type: 'date' }
    ]" 
    :actions="{ view: true, edit: false, delete: false }" 
    :show-add-button="false"
    :custom-cells="['completed']"
  >
    <template #item.completed="{ item }">
      <VChip :color="item.completed ? 'success' : 'primary'" size="small">
        {{ item.completed ? 'Concluída' : 'Pendente' }}
      </VChip>
    </template>
  </CrudPage>
</template>
