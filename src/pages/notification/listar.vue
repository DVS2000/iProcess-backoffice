<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage resource="/notification" title="Notificações" :fields="[{ key: 'message', label: 'Mensagem' }, { key: 'read', label: 'Lida' }, { key: 'user.name', label: 'Usuário'}, { key: 'createdAt', label: 'Criada em' }]" :actions="[{}]" :show-add-button="false" :custom-cells="['read']">
    <template #item.read="{ item }">
      <VChip :color="item.read ? 'success' : 'warning'" size="small">{{ item.read ? 'Lida' : 'Não lida' }}</VChip>
    </template>
  </CrudPage>
</template>
