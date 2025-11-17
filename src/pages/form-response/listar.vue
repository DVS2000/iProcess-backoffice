<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/form-response" title="Respostas de Formulário" :fields="[{ key: 'form.title', label: 'Formulário' }, { key: 'response.nome', label: 'Respondido por' }, { key: 'user.name', label: 'Criado por' }, { key: 'submittedAt', label: 'Enviado em' }]" :show-add-button="false" :actions="{ view: true, edit: false, delete: false }" />
</template>
