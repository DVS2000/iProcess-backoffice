<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { $api } from '@/utils/api'

const router = useRouter()
const onView = item => router.push({ name: 'role-model-id', params: { id: item.id } })

const allPermissions = ref([])
const selectedPermissionIds = ref([])

const loadAllPermissions = async () => {
  try {
    const resp = await $api('/permissions?page=1&limit=50')
    const payload = resp?.data ?? resp
    const list = payload?.data ?? payload

    allPermissions.value = Array.isArray(list) ? list : []
  } catch {}
}

await loadAllPermissions()

const preSaveRole = async (form, editing) => {
  if (editing?.id) return form
  
  return {
    name: form.name,
    description: form.description || undefined,
    permissionIds: selectedPermissionIds.value,
  }
}
</script>

<template>
  <CrudPage
    resource="/role-model"
    title="Níveis de acessos"
    :fields="[{ key: 'name', label: 'Nome', required: true }, { key: 'description', label: 'Descrição' }]"
    :actions="{ view: true, edit: false, delete: false }"
    :pre-save="preSaveRole"
    create-endpoint="/roles"
    @view="onView"
  >
    <template #item.actions="{ item }">
      <div class="d-flex gap-2">
        <VBtn size="small" variant="text" color="secondary" @click="onView(item)">
<VIcon icon="tabler-eye" />
</VBtn>
        <VBtn v-if="item?.name !== 'SUPER_ADMIN' && item?.name !== 'Super Administrador'" size="small" variant="text" color="primary" @click="router.push({ name: 'role-model-id', params: { id: item.id }, query: { edit: 'true' } })">
<VIcon icon="tabler-pencil" />
</VBtn>
      </div>
    </template>
    <template #form-fields="{ form }">
      <VCol cols="12" md="6">
        <VTextField v-model="form.name" label="Nome" required />
      </VCol>
      <VCol cols="12" md="6">
        <VTextField v-model="form.description" label="Descrição" />
      </VCol>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Permissões</VCardTitle>
          <VCardText>
            <VRow>
              <VCol v-for="p in allPermissions" :key="p.id" cols="12" md="6">
                <VCheckbox
:model-value="selectedPermissionIds.includes(String(p.id))" :label="`${p.resource} :: ${p.action}`" @update:model-value="val => {
                  const pid = String(p.id)
                  const idx = selectedPermissionIds.indexOf(pid)
                  if (val && idx < 0) selectedPermissionIds.push(pid)
                  else if (!val && idx >= 0) selectedPermissionIds.splice(idx, 1)
                }"
/>
                <div class="text-caption text-medium-emphasis">
{{ p.description }}
</div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </template>
  </CrudPage>
</template>
