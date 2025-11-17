<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const id = computed(() => route.params.id)
const { data, isFetching, error } = await useApi(`/form/${id.value}`)
const item = computed(() => data.value?.data || data.value)
</script>

<template>
  <VCard>
    <VCardTitle>Formulário</VCardTitle>
    <VCardText>
      <VProgressLinear v-if="isFetching" indeterminate class="mb-4" />
      <VAlert v-if="error" type="error" variant="tonal" class="mb-4">{{ (error && error.message) || 'Falha ao carregar' }}</VAlert>
      <div v-if="item">
        <div>ID: {{ item.id }}</div>
        <div>Nome: {{ item.name || item.title }}</div>
        <div>Descrição: {{ item.description }}</div>
        <div>Criado em: {{ item.createdAt }}</div>
        <div>Atualizado em: {{ item.updatedAt }}</div>
      </div>
    </VCardText>
  </VCard>
</template>