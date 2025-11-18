<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'
import { createUrl } from '@/@core/composable/createUrl'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)
const isEdit = computed(() => route.query?.edit === 'true')

const { data: folderData, execute: fetchFolder, isFetching, error } = await useApi(`/folder/${id.value}`)

watch(id, async () => { await fetchFolder() })

const folderItem = computed(() => folderData.value?.data)

const name = ref('')
const description = ref('')

watch(folderItem, val => {
  if (val) {
    name.value = val.name || ''
    description.value = val.description || ''
  }
}, { immediate: true })

const { data: foldersData } = await useApi(createUrl('/folder', { query: { page: 1, limit: 50 } }))
const parentOptions = computed(() => (foldersData.value?.data?.data || []).filter(f => f.id !== id.value).map(f => ({ label: f.name || f.id, value: f.id })))
const parentId = ref(null)

watch(folderItem, val => { parentId.value = val?.parentId || val?.parent?.id || null }, { immediate: true })

const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

const save = async () => {
  saveError.value = ''
  saveSuccess.value = ''
  try {
    saving.value = true

    const payload = {
      name: name.value,
      description: description.value || null,
      parent: parentId.value ? { connect: { id: parentId.value } } : { disconnect: true },
    }

    const resp = await $api(`/folder/${id.value}`, { method: 'PUT', body: payload })
    if (resp) {
      saveSuccess.value = 'Pasta atualizada com sucesso.'
      await fetchFolder()
    }
  } catch (err) {
    saveError.value = err?.data?.message || (err && err.message) || 'Falha ao atualizar pasta.'
  } finally {
    saving.value = false
  }
}

const back = () => router.push({ name: 'folder-listar' })

const tab = ref('children')

const childrenTree = ref([])
const isFetchingTree = ref(false)

const fetchTree = async () => {
  isFetchingTree.value = true
  try {
    const resp = await $api(`/folder/${id.value}/tree/complete`)
    const nodes = Array.isArray(resp) ? resp : (resp?.children || resp?.data?.children || [])

    childrenTree.value = nodes || []
  } catch (err) {
  } finally {
    isFetchingTree.value = false
  }
}

watch(id, async () => { await fetchTree() })
onMounted(async () => { if (id.value) await fetchTree() })

const documents = ref([])
const isFetchingDocuments = ref(false)

const fetchDocuments = async () => {
  isFetchingDocuments.value = true
  try {
    const resp = await $api(`/folder/${id.value}/documents`)
    const arr = Array.isArray(resp) ? resp : (resp?.data || resp?.documents || [])

    documents.value = arr || []
  } catch (err) {
  } finally {
    isFetchingDocuments.value = false
  }
}

watch(id, async () => { await fetchDocuments() })
onMounted(async () => { if (id.value) await fetchDocuments() })

const permissions = ref([])
const isFetchingPermissions = ref(false)

const fetchPermissions = async () => {
  isFetchingPermissions.value = true
  try {
    const resp = await $api(`/folder-permission/folder/${id.value}`)
    const arr = Array.isArray(resp) ? resp : (resp?.data || [])

    permissions.value = arr || []
  } catch (err) {
  } finally {
    isFetchingPermissions.value = false
  }
}

watch(id, async () => { await fetchPermissions() })
onMounted(async () => { if (id.value) await fetchPermissions() })


// Permissões: adicionar/editar/remover
const createPermDialog = ref(false)
const userSearch = ref('')
const userOptions = ref([])
const userLoading = ref(false)
const selectedUserId = ref('')
const selectedPermission = ref('READ')
const addingPerm = ref(false)
const permError = ref('')
const permSuccess = ref('')

const permissionOptions = [
  { title: 'Ler', value: 'READ' },
  { title: 'Escrever', value: 'WRITE' },
  { title: 'Apagar', value: 'DELETE' },
  { title: 'Admin', value: 'ADMIN' },
]

const loadUsers = async () => {
  userLoading.value = true
  try {
    const resp = await $api('/user', { query: { page: 1, limit: 10, search: userSearch.value || undefined } })
    const data = resp?.data ?? resp
    const arr = Array.isArray(data) ? data : (data?.data || [])

    userOptions.value = arr.map(u => ({ label: u.name || u.email || u.id, value: u.id }))
  } catch (err) {
  } finally {
    userLoading.value = false
  }
}

const openAddPermission = async () => {
  permError.value = ''
  permSuccess.value = ''
  selectedUserId.value = ''
  selectedPermission.value = 'READ'
  createPermDialog.value = true
  await loadUsers()
}

const createPermission = async () => {
  permError.value = ''
  permSuccess.value = ''
  if (!selectedUserId.value) {
    permError.value = 'Selecione o usuário.'

    return
  }
  addingPerm.value = true
  try {
    await $api('/folder-permission', { method: 'POST', body: { folderId: id.value, userId: selectedUserId.value, permission: selectedPermission.value } })
    permSuccess.value = 'Permissão adicionada com sucesso.'
    createPermDialog.value = false
    await fetchPermissions()
  } catch (err) {
    permError.value = err?.data?.message || 'Falha ao adicionar permissão.'
  } finally {
    addingPerm.value = false
  }
}

const editPermDialog = ref(false)
const editingPerm = ref(null)
const editPermissionType = ref('READ')
const savingPermEdit = ref(false)
const openEditPerm = p => { editingPerm.value = p; editPermissionType.value = p?.permission || 'READ'; editPermDialog.value = true }

const savePermissionEdit = async () => {
  if (!editingPerm.value) return
  savingPermEdit.value = true
  try {
    await $api(`/folder-permission/${editingPerm.value.id}`, { method: 'PUT', body: { permission: editPermissionType.value } })
    editPermDialog.value = false
    editingPerm.value = null
    await fetchPermissions()
  } catch (err) {
  } finally {
    savingPermEdit.value = false
  }
}

const removingPermId = ref(null)

const removePermission = async p => {
  permError.value = ''
  removingPermId.value = p.id
  try {
    await $api(`/folder-permission/${p.id}`, { method: 'DELETE' })
    await fetchPermissions()
  } catch (err) {
    permError.value = err?.data?.message || 'Falha ao remover permissão.'
  } finally {
    removingPermId.value = null
  }
}

// Documentos: ações
const viewDocument = doc => {
  router.push({ name: 'document-id', params: { id: doc.id } })
}

const addDocument = () => {
  router.push({ name: 'document-adicionar', query: { folderId: id.value } })
}
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" lg="7">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Pasta</span>
          <div class="d-flex gap-2">
            <VBtn variant="text" color="secondary" @click="back">Voltar</VBtn>
          </div>
        </VCardTitle>
        <VCardText>
          <VProgressLinear v-if="isFetching" indeterminate class="mb-4" />
          <VAlert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ (error && error.message) || 'Falha ao carregar pasta.' }}
          </VAlert>

          <div v-if="folderItem">
            <div class="mb-6">
              <div class="text-h6 mb-2">Informações</div>
              <div class="text-body-1">ID: {{ folderItem.id }}</div>
              <div class="text-body-1">Nome: {{ folderItem.name }}</div>
              <div class="text-body-1">Descrição: {{ folderItem.description || '-' }}</div>
              <div class="text-body-1">Criado em: {{ folderItem.createdAt }}</div>
              <div class="text-body-1">Editado em: {{ folderItem.updatedAt }}</div>
            </div>

            <VDivider class="my-6" />

            <div v-if="isEdit">
              <div class="text-h6 mb-4">Editar</div>
              <VAlert v-if="saveError" type="error" variant="tonal" class="mb-4">{{ saveError }}</VAlert>
              <VAlert v-if="saveSuccess" type="success" variant="tonal" class="mb-4">{{ saveSuccess }}</VAlert>

              <VForm @submit.prevent="save">
                <VTextField v-model="name" label="Nome" class="mb-4" />
                <VTextarea v-model="description" label="Descrição" class="mb-4" />
                <VAutocomplete v-model="parentId" :items="parentOptions" label="Pasta Pai" item-title="label" item-value="value" clearable class="mb-4" />
                <VBtn color="primary" type="submit" :loading="saving">Salvar</VBtn>
              </VForm>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VTabs v-model="tab" class="mb-4">
    <VTab value="children">Filhos</VTab>
    <VTab value="documents">Documentos</VTab>
    <VTab value="permissions">Permissões</VTab>
  </VTabs>

  <VRow v-if="tab === 'children'">
    <VCol cols="12">
      <VCard>
        <VCardTitle>Pastas Filhas</VCardTitle>
        <VCardText>
          <VDataTable
:headers="[
            { title: 'Nome', key: 'name' },
            { title: 'Criado em', key: 'createdAt' },
            { title: 'Editado em', key: 'updatedAt' },
          ]" :items="childrenTree" :loading="isFetchingTree" item-value="id" class="text-no-wrap">
            <template #item.name="{ item }">
              {{ item?.name }}
            </template>
            <template #item.createdAt="{ item }">
              {{ item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-' }}
            </template>
            <template #item.updatedAt="{ item }">
              {{ item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-' }}
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VRow v-if="tab === 'documents'">
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Documentos</span>
          <div class="d-flex gap-2">
            <VBtn color="primary" @click="addDocument"><VIcon icon="tabler-plus" class="me-2" />Adicionar Documento</VBtn>
          </div>
        </VCardTitle>
        <VCardText>
          <VDataTable
:headers="[
            { title: 'Título', key: 'title' },
            { title: 'Criado em', key: 'createdAt' },
            { title: 'Editado em', key: 'updatedAt' },
            { title: 'Ações', key: 'actions', sortable: false },
          ]" :items="documents" :loading="isFetchingDocuments" item-value="id" class="text-no-wrap">
            <template #item.title="{ item }">
              {{ item?.title }}
            </template>
            <template #item.createdAt="{ item }">
              {{ item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-' }}
            </template>
            <template #item.updatedAt="{ item }">
              {{ item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-' }}
            </template>
            <template #item.actions="{ item }">
              <VBtn size="small" variant="text" color="primary" @click="viewDocument(item)">
                <VIcon icon="tabler-eye" />
              </VBtn>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VRow v-if="tab === 'permissions'">
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Permissões</span>
          <div class="d-flex gap-2">
            <VBtn color="primary" @click="openAddPermission">Adicionar permissão</VBtn>
          </div>
        </VCardTitle>
        <VCardText>
          <VAlert v-if="permError" type="error" variant="tonal" class="mb-4">{{ permError }}</VAlert>
          <VAlert v-if="permSuccess" type="success" variant="tonal" class="mb-4">{{ permSuccess }}</VAlert>
          <VDataTable
:headers="[
            { title: 'Usuário', key: 'user' },
            { title: 'Permissão', key: 'permission' },
            { title: 'Concedido por', key: 'grantedBy' },
            { title: 'Criado em', key: 'createdAt' },
            { title: 'Ações', key: 'actions', sortable: false },
          ]" :items="permissions" :loading="isFetchingPermissions" item-value="id" class="text-no-wrap">
            <template #item.user="{ item }">
              {{ item?.user?.name || item?.user?.email || '-' }}
            </template>
            <template #item.grantedBy="{ item }">
              {{ item?.grantedBy?.name || item?.grantedBy?.email || '-' }}
            </template>
            <template #item.createdAt="{ item }">
              {{ item?.createdAt ? new Date(item.createdAt).toLocaleString() : '-' }}
            </template>
            <template #item.permission="{ item }">
              {{ item?.permission }}
            </template>
            <template #item.actions="{ item }">
              <VBtn size="small" variant="text" color="info" @click="openEditPerm(item)">
                <VIcon icon="tabler-pencil" />
              </VBtn>
              <VBtn size="small" variant="text" color="error" :loading="removingPermId === item.id" @click="removePermission(item)">
                <VIcon icon="tabler-trash" />
              </VBtn>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog v-model="editPermDialog" max-width="520">
    <VCard>
      <VCardTitle>Editar permissão</VCardTitle>
      <VCardText>
        <VSelect v-model="editPermissionType" :items="permissionOptions" item-title="title" item-value="value" label="Permissão" />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="editPermDialog = false">Cancelar</VBtn>
        <VBtn color="primary" :loading="savingPermEdit" @click="savePermissionEdit">Guardar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog v-model="createPermDialog" max-width="560">
    <VCard>
      <VCardTitle>Adicionar permissão</VCardTitle>
      <VCardText>
        <VAlert v-if="permError" type="error" variant="tonal" class="mb-4">{{ permError }}</VAlert>
        <VForm @submit.prevent="createPermission">
          <VRow>
            <VCol cols="12" md="6">
              <VAutocomplete v-model="selectedUserId" :items="userOptions" :loading="userLoading" item-title="label" item-value="value" label="Usuário" @update:search="val => { userSearch = val; loadUsers() }" />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="selectedPermission" :items="permissionOptions" item-title="title" item-value="value" label="Permissão" />
            </VCol>
          </VRow>
          <VCardActions>
            <VSpacer />
            <VBtn variant="text" @click="createPermDialog = false">Cancelar</VBtn>
            <VBtn color="primary" type="submit" :loading="addingPerm" :disabled="!selectedUserId">Adicionar</VBtn>
          </VCardActions>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
