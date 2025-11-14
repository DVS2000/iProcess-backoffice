<script setup>
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from '@/@core/composable/createUrl'
import { useRouter } from 'vue-router'

const router = useRouter()

const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')

const { data, isFetching, error } = await useApi(createUrl('/folder', {
  query: { page, limit: itemsPerPage, search },
}))

const folders = computed(() => data.value?.data?.data || [])
const totalItems = computed(() => data.value?.data?.pagination?.total || 0)

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Descrição', key: 'description' },
  { title: 'Criado em', key: 'createdAt' },
  { title: 'Editado em', key: 'updatedAt' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const visualizar = folder => {
  router.push({ name: 'folder-id', params: { id: folder.id } })
}

const editar = folder => {
  router.push({ name: 'folder-id', params: { id: folder.id }, query: { edit: 'true' } })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center flex-wrap gap-3 w-80">
            <VTextField
              v-model="search"
              placeholder="Pesquisar pasta"
              density="comfortable"
              hide-details
              clearable
              prepend-inner-icon="tabler-search"
              class="flex-grow-1"
              style="min-width: 360px; width: clamp(360px, 50vw, 720px)"
            />
          </div>
          <div>
            <VBtn color="primary" @click="router.push({ name: 'folder-adicionar' })">
              <VIcon icon="tabler-plus" class="me-2" />
              Adicionar
            </VBtn>
          </div>
        </VCardTitle>
        <VCardText v-if="error" class="py-0">
          <VAlert type="error" variant="tonal" class="mb-4">
            {{ (error && error.message) || 'Falha ao carregar pastas.' }}
          </VAlert>
        </VCardText>
        <VDataTableServer
          :headers="headers"
          :items="folders"
          :items-length="totalItems"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :loading="isFetching"
          class="text-no-wrap"
        >
          <template #item.name="{ item }">
            {{ item?.name }}
          </template>
          <template #item.description="{ item }">
            {{ item?.description || '-' }}
          </template>
          <template #item.createdAt="{ item }">
            {{ item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-' }}
          </template>
          <template #item.updatedAt="{ item }">
            {{ item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-' }}
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <VBtn size="small" variant="text" color="primary" @click="visualizar(item)">
                <VIcon icon="tabler-eye" />
              </VBtn>
              <VBtn size="small" variant="text" color="info" @click="editar(item)">
                <VIcon icon="tabler-pencil" />
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </VCard>
    </VCol>
  </VRow>
  </template>
