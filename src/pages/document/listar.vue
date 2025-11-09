<script setup>
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from '@/@core/composable/createUrl'
import { useRouter } from 'vue-router'

const router = useRouter()

// Table: pagination and search
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')

// API: use refs directly in createUrl for automatic refetch
const { data, execute: fetchDocuments, isFetching, error } = await useApi(createUrl('/document', {
  query: { page, limit: itemsPerPage, search },
}))

const documents = computed(() => data.value?.data?.data || [])
const totalItems = computed(() => data.value?.data?.pagination?.total || 0)

// Columns
const headers = [
  { title: 'Título', key: 'title' },
  { title: 'Proprietário', key: 'owner' },
  { title: 'Criado em', key: 'createdAt' },
  { title: 'Ações', key: 'actions', sortable: false },
]

// Actions
const visualizar = doc => {
  router.push({ name: 'document-id', params: { id: doc.id } })
}

const editar = doc => {
  router.push({ name: 'document-id', params: { id: doc.id }, query: { edit: 'true' } })
}

const deletingId = ref(null)
const deleteDialog = ref(false)

const askDelete = doc => {
  deletingId.value = doc.id
  deleteDialog.value = true
}

const { del } = useApi('/document')

const deleteDocument = async () => {
  try {
    if (!deletingId.value) return
    await del(`/document/${deletingId.value}`)
    deleteDialog.value = false
    deletingId.value = null
    // Refresh current page via execute (refetch)
    fetchDocuments()
  } catch (err) {
    console.error(err)
  }
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
              placeholder="Pesquisar documento"
              density="comfortable"
              hide-details
              clearable
              prepend-inner-icon="tabler-search"
              class="flex-grow-1"
              style="min-width: 360px; width: clamp(360px, 50vw, 720px)"
            />
          </div>
          <div>
            <VBtn color="primary" @click="router.push({ name: 'document-adicionar' })">
              <VIcon icon="tabler-plus" class="me-2" />
              Adicionar
            </VBtn>
          </div>
        </VCardTitle>
        <VCardText v-if="error" class="py-0">
          <VAlert type="error" variant="tonal" class="mb-4">
            {{ (error && error.message) || 'Falha ao carregar documentos.' }}
          </VAlert>
        </VCardText>
        <VDataTableServer
          :headers="headers"
          :items="documents"
          :items-length="totalItems"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :loading="isFetching"
          class="text-no-wrap"
        >
          <template #item.title="{ item }">
            {{ item?.title }}
          </template>
          <template #item.owner="{ item }">
            {{ item?.owner?.name || '-' }}
          </template>
          <template #item.createdAt="{ item }">
            {{ item?.createdAt }}
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <VBtn size="small" variant="text" color="primary" @click="visualizar(item)">
                <VIcon icon="tabler-eye" />
              </VBtn>
              <VBtn size="small" variant="text" color="info" @click="editar(item)">
                <VIcon icon="tabler-pencil" />
              </VBtn>
              <VBtn size="small" variant="text" color="error" @click="askDelete(item)">
                <VIcon icon="tabler-trash" />
              </VBtn>
            </div>
          </template>
        </VDataTableServer>
      </VCard>
    </VCol>
  </VRow>

  <!-- Delete dialog -->
  <VDialog v-model="deleteDialog" max-width="420">
    <VCard>
      <VCardTitle>Remover documento</VCardTitle>
      <VCardText>
        Tem certeza que deseja eliminar este documento? Esta ação não pode ser desfeita.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" @click="deleteDocument">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>