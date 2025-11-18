<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { $api } from '@/utils/api'

const router = useRouter()

const name = ref('')
const description = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  if (!name.value || typeof name.value !== 'string') {
    errorMessage.value = 'Informe um nome válido.'

    return
  }
  try {
    loading.value = true

    const payload = { name: name.value }
    if (description.value) payload.description = description.value
    const resp = await $api('/folder', { method: 'POST', body: payload })
    const id = resp?.id || resp?.data?.id
    if (id) {
      router.push({ name: 'folder-id', params: { id } })
    } else {
      errorMessage.value = 'Falha ao criar pasta.'
    }
  } catch (err) {
    errorMessage.value = (err && err.message) || 'Falha ao criar pasta.'
  } finally {
    loading.value = false
  }
}

const goBack = () => router.push({ name: 'folder-listar' })
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" lg="7">
      <VCard>
        <VCardTitle>Adicionar Pasta</VCardTitle>
        <VCardText>
          <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4">{{ errorMessage }}</VAlert>

          <VForm @submit.prevent="handleSubmit">
            <VTextField v-model="name" label="Nome" placeholder="Nome da pasta" class="mb-4" required />
            <VTextarea v-model="description" label="Descrição (opcional)" placeholder="Descrição da pasta" class="mb-6" />
            <div class="d-flex gap-4">
              <VBtn :loading="loading" color="primary" type="submit">Criar</VBtn>
              <VBtn variant="text" color="secondary" @click="goBack">Voltar</VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
