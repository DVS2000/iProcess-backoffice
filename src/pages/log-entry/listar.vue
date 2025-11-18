<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/log-entry" title="Logs" pagination-query-mode="offset" :fields="[{ key: 'id', label: 'ID' }, { key: 'action', label: 'Evento' }, { key: 'user.name', label: 'Utilizador' }, { key: 'user.email', label: 'E-mail' }, { key: 'timestamp', label: 'Criado em' }]" :actions="[{}]" :show-add-button="false"/>
</template>
