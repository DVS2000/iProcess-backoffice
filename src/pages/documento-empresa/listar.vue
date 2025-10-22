<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { createUrl } from '@/@core/composable/createUrl'

const router = useRouter()

// Tabela: paginação e pesquisa
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')

// API: use refs diretamente no createUrl para refetch automático
const { data, execute: fetchDocs, isFetching, error } = await useApi(createUrl('/documento-empresa', {
  query: { page, limit: itemsPerPage, search },
}))

const documentos = computed(() => data.value?.data?.data || [])
const total = computed(() => data.value?.data?.meta?.total || 0)

const headers = [
  { title: 'Tipo', key: 'tipoDocumento' },
  { title: 'Número Ref.', key: 'numeroRef' },
  { title: 'Empresa', key: 'empresa.nomeSocial' },
  { title: 'Validade', key: 'validade' },
  { title: 'Ficheiro', key: 'ficheiro' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const goView = id => router.push({ name: 'documento-empresa-id', params: { id } })
const goEdit = id => router.push({ name: 'documento-empresa-id', params: { id }, query: { edit: 'true' } })

const deletingId = ref(null)
const deleteDialog = ref(false)
const askDelete = id => { deletingId.value = id; deleteDialog.value = true }

const deleteDoc = async () => {
  try {
    if (!deletingId.value) return
    await $api(`/documento-empresa/${deletingId.value}`, { method: 'DELETE' })
    deleteDialog.value = false
    deletingId.value = null
    fetchDocs()
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Documentos da Empresa</span>
      <div class="d-flex gap-2">
        <VTextField v-model="search" density="compact" placeholder="Pesquisar" hide-details clearable prepend-inner-icon="tabler-search" />
        <VBtn color="primary" @click="router.push({ name: 'documento-empresa-criar' })">
          <VIcon icon="tabler-plus" class="me-2" />
          Adicionar
        </VBtn>
      </div>
    </VCardTitle>
    <VCardText>
      <VDataTableServer
        :items="documentos"
        :headers="headers"
        :items-length="total"
        :loading="isFetching"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        class="text-no-wrap"
      >
        <template #item[empresa.nomeSocial]="{ item }">
          <span>{{ item?.empresa?.nomeSocial || '-' }}</span>
        </template>
        <template #item[validade]="{ item }">
          <span>{{ item?.validade ? new Date(item.validade).toLocaleDateString() : '-' }}</span>
        </template>
        <template #item[ficheiro]="{ item }">
          <a :href="item?.ficheiro" target="_blank">Abrir</a>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn icon variant="text" color="info" @click="goView(item.id)"><VIcon icon="tabler-eye" /></VBtn>
            <VBtn icon variant="text" color="primary" @click="goEdit(item.id)"><VIcon icon="tabler-pencil" /></VBtn>
            <VBtn icon variant="text" color="error" @click="askDelete(item.id)"><VIcon icon="tabler-trash" /></VBtn>
          </div>
        </template>
      </VDataTableServer>

      <VDialog v-model="deleteDialog" max-width="420">
        <VCard>
          <VCardTitle>Eliminar documento?</VCardTitle>
          <VCardText>Esta ação é irreversível. Deseja continuar?</VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
            <VBtn color="error" @click="deleteDoc">Eliminar</VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </VCardText>
  </VCard>
</template>