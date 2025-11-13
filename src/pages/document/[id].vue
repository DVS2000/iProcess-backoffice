<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'
import { ofetch } from 'ofetch'
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

const versions = ref([])
const isFetchingVersions = ref(false)

const fetchVersions = async () => {
  isFetchingVersions.value = true
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    const accessToken = useCookie('accessToken').value

    const resp = await ofetch(`/document-version/document/${id.value}`, {
      baseURL,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })

    versions.value = Array.isArray(resp) ? resp : (resp?.data || [])
  } catch (err) {
    console.error(err)
  } finally {
    isFetchingVersions.value = false
  }
}

watch(id, async () => { await fetchVersions() })
onMounted(async () => { if (id.value) await fetchVersions() })

const newVersionFile = ref(null)
const newVersionChanges = ref('')
const addingVersion = ref(false)
const versionError = ref('')
const versionSuccess = ref('')
const createDialog = ref(false)

const createVersion = async () => {
  versionError.value = ''
  versionSuccess.value = ''
  if (!newVersionFile.value) {
    versionError.value = 'Selecione um ficheiro para criar a versão.'
    return
  }
  addingVersion.value = true
  try {
    const f = Array.isArray(newVersionFile.value) ? newVersionFile.value[0] : newVersionFile.value
    const fd = new FormData()

    fd.append('file', f)
    if (newVersionChanges.value) fd.append('changes', newVersionChanges.value)
    await $api(`/document-version/upload/${id.value}`, { method: 'POST', body: fd })
    newVersionFile.value = null
    newVersionChanges.value = ''
    await fetchDoc()
    await fetchVersions()
    versionSuccess.value = 'Versão criada com sucesso.'
  } catch (err) {
    console.error(err)
    versionError.value = (err && err.message) || 'Falha ao criar versão.'
  } finally {
    addingVersion.value = false
  }
}

const editDialog = ref(false)
const editingVersion = ref(null)
const editChanges = ref('')
const savingEdit = ref(false)
const openEdit = v => { editingVersion.value = v; editChanges.value = v?.changes || ''; editDialog.value = true }

const saveEdit = async () => {
  if (!editingVersion.value) return
  savingEdit.value = true
  try {
    await $api(`/document-version/${editingVersion.value.id}`, { method: 'PATCH', body: { changes: editChanges.value } })
    editDialog.value = false
    editingVersion.value = null
    editChanges.value = ''
    await fetchVersions()
  } catch (err) {
    console.error(err)
  } finally {
    savingEdit.value = false
  }
}

const downloadVersion = async v => {
  try {
    const blob = await $api(`/document-version/${v.id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const name = (v?.document?.title ? `${v.document.title}-v${v.version}` : `documento-versao-${v.version}`)
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
  }
}
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

  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Versões</span>
          <div class="d-flex gap-2">
            <VBtn color="primary" @click="createDialog = true">Nova versão</VBtn>
          </div>
        </VCardTitle>
        <VCardText>
          <VAlert v-if="versionError" type="error" variant="tonal" class="mb-4">{{ versionError }}</VAlert>
          <VAlert v-if="versionSuccess" type="success" variant="tonal" class="mb-4">{{ versionSuccess }}</VAlert>

          <VDataTable :headers="[
            { title: 'Versão', key: 'version' },
            { title: 'Alterações', key: 'changes' },
            { title: 'Criado por', key: 'createdBy' },
            { title: 'Criado em', key: 'createdAt' },
            { title: 'Ações', key: 'actions', sortable: false },
          ]" :items="versions" :loading="isFetchingVersions" item-value="id" class="text-no-wrap">
            <template #item.createdBy="{ item }">
              {{ item?.createdBy?.name || item?.createdBy?.email || '-' }}
            </template>
            <template #item.createdAt="{ item }">
              {{ item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-' }}
            </template>
            <template #item.actions="{ item }">
              <VBtn size="small" variant="text" color="info" @click="openEdit(item)">
                <VIcon icon="tabler-pencil" />
              </VBtn>
              <VBtn size="small" variant="text" color="success" @click="downloadVersion(item)">
                <VIcon icon="tabler-download" />
              </VBtn>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog v-model="editDialog" max-width="520">
    <VCard>
      <VCardTitle>Editar versão</VCardTitle>
      <VCardText>
        <VTextField v-model="editChanges" label="Alterações" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="editDialog = false">Cancelar</VBtn>
        <VBtn color="primary" :loading="savingEdit" @click="saveEdit">Guardar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog v-model="createDialog" max-width="560">
    <VCard>
      <VCardTitle>Nova versão</VCardTitle>
      <VCardText>
        <VAlert v-if="versionError" type="error" variant="tonal" class="mb-4">{{ versionError }}</VAlert>
        <VForm @submit.prevent="createVersion">
          <VRow>
            <VCol cols="12" md="6">
              <VTextField v-model="newVersionChanges" label="Alterações (opcional)" />
            </VCol>
            <VCol cols="12" md="6">
              <VFileInput v-model="newVersionFile" label="Ficheiro" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" required />
            </VCol>
          </VRow>
          <VCardActions>
            <VSpacer />
            <VBtn variant="text" @click="createDialog = false">Cancelar</VBtn>
            <VBtn color="primary" type="submit" :loading="addingVersion" :disabled="!newVersionFile">Adicionar</VBtn>
          </VCardActions>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
