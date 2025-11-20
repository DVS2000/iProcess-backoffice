<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/process" title="Processos" :fields="[{ key: 'nome', label: 'Nome' }, { key: 'empresa.nomeSocial', label: 'Empresa' }, { key: 'status', label: 'Estado' }, { key: 'createdAt', label: 'Criado em' }, { key: 'updatedAt', label: 'Atualizado em' }]" :actions="{view: true, edit: true,}" />
</template>
