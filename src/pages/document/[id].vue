<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { createUrl } from '@/@core/composable/createUrl'

const route = useRoute('document-id')
const router = useRouter()
const id = computed(() => route.params.id)
const isEdit = computed(() => route.query?.edit === 'true')

// Fetch document by id
const { data: docData, execute: fetchDoc, isFetching, error } = await useApi(`/document/${id.value}`)

watch(id, async () => {
  await fetchDoc()
})

const documentItem = computed(() => docData.value?.data)

// Editable fields
const title = ref('')
const folderId = ref(null)
const policyId = ref(null)

watch(documentItem, val => {
  if (val) {
    title.value = val.title || ''
    folderId.value = val.folderId || val.folder?.id || null
    policyId.value = val.policyId || val.compliancePolicy?.id || null
  }
}, { immediate: true })

// Fetch folders/policies options
const { data: foldersData } = await useApi(createUrl('/folder', { query: { page: 1, limit: 50 } }))
const folderOptions = computed(() => (foldersData.value?.data?.data || []).map(f => ({ label: f.name || f.nome || f.title || f.id, value: f.id })))

const { data: policiesData } = await useApi(createUrl('/compliance-policy', { query: { page: 1, limit: 50 } }))
const policyOptions = computed(() => (policiesData.value?.data?.data || []).map(p => ({ label: p.name || p.title || p.id, value: p.id })))

// Update document
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')
const { put } = useApi('/document')

const save = async () => {
  saveError.value = ''
  saveSuccess.value = ''
  try {
    saving.value = true
    const payload = {
      title: title.value,
      folder: folderId.value ? { connect: { id: folderId.value } } : { disconnect: true },
      compliancePolicy: policyId.value ? { connect: { id: policyId.value } } : { disconnect: true },
    }
    const resp = await put(`/document/${id.value}`, { json: payload })
    if (resp?.data) {
      saveSuccess.value = 'Documento atualizado com sucesso.'
      await fetchDoc()
    }
  } catch (err) {
    console.error(err)
    saveError.value = (err && err.message) || 'Falha ao atualizar documento.'
  } finally {
    saving.value = false
  }
}

const back = () => router.push({ name: 'document-listar' })
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" lg="7">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Documento</span>
          <div class="d-flex gap-2">
            <VBtn variant="text" color="secondary" @click="back">Voltar</VBtn>
          </div>
        </VCardTitle>
        <VCardText>
          <VProgressLinear v-if="isFetching" indeterminate class="mb-4" />
          <VAlert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ (error && error.message) || 'Falha ao carregar documento.' }}
          </VAlert>

          <div v-if="documentItem">
            <div class="mb-6">
              <div class="text-h6 mb-2">Informações</div>
              <div class="text-body-1">ID: {{ documentItem.id }}</div>
              <div class="text-body-1">Título: {{ documentItem.title }}</div>
              <div class="text-body-1">Proprietário: {{ documentItem.owner?.name || '-' }}</div>
              <div class="text-body-1">Criado em: {{ documentItem.createdAt }}</div>
            </div>

            <VDivider class="my-6" />

            <div v-if="isEdit">
              <div class="text-h6 mb-4">Editar</div>
              <VAlert v-if="saveError" type="error" variant="tonal" class="mb-4">{{ saveError }}</VAlert>
              <VAlert v-if="saveSuccess" type="success" variant="tonal" class="mb-4">{{ saveSuccess }}</VAlert>

              <VForm @submit.prevent="save">
                <VTextField v-model="title" label="Título" class="mb-4" />

                <VAutocomplete
                  v-model="folderId"
                  :items="folderOptions"
                  label="Pasta"
                  item-title="label"
                  item-value="value"
                  clearable
                  class="mb-4"
                />

                <VAutocomplete
                  v-model="policyId"
                  :items="policyOptions"
                  label="Política de Compliance"
                  item-title="label"
                  item-value="value"
                  clearable
                  class="mb-4"
                />

                <VBtn color="primary" type="submit" :loading="saving">Salvar</VBtn>
              </VForm>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>