<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

const { data, isFetching, error, execute: reload } = await useApi(`/role-model/${id.value}`)
const role = computed(() => data.value?.data || data.value)

const isSuperAdmin = computed(() => {
  const n = role.value?.name || ''
  
  return n === 'SUPER_ADMIN' || n === 'Super Administrador'
})

const formatDate = d => (d ? new Date(d).toLocaleString() : '-')

const startEdit = () => {
  if (isSuperAdmin.value) return
  router.replace({ name: 'role-model-id', params: { id: id.value }, query: { edit: 'true' } })
}

const isEdit = computed(() => String(route.query.edit) === 'true' || route.query.edit === '1')
const name = ref('')
const description = ref('')
const allPermissions = ref([])
const selectedPermissionIds = ref([])

const loadAllPermissions = async () => {
  let list = []

  const tryEndpoints = async endpoints => {
    for (const ep of endpoints) {
      try {
        const resp = await $api(ep)
        const payload = resp?.data ?? resp
        const data = payload?.data ?? payload
        if (Array.isArray(data)) return data
      } catch {}
    }

    return []
  }

  list = await tryEndpoints([
    '/permissions?page=1&limit=60',
    '/role-permission',
  ])
  if (!list.length) { allPermissions.value = []  

    return }
  if (list.length && list[0]?.permission && !list[0]?.resource) {
    const map = new Map()
    for (const rp of list) {
      const p = rp.permission
      if (p && !map.has(p.id)) map.set(p.id, p)
    }
    allPermissions.value = Array.from(map.values())
  } else {
    allPermissions.value = list
  }
}

const initEdit = async () => {
  name.value = role.value?.name || ''
  description.value = role.value?.description || ''
  selectedPermissionIds.value = (role.value?.permissions || [])
    .map(rp => String(rp?.permissionId ?? rp?.permission?.id))
    .filter(Boolean)
  await loadAllPermissions()
}

if (!isSuperAdmin.value && isEdit.value && role.value) {
  await initEdit()
}

watch([isEdit, role], async ([edit, r]) => {
  if (!isSuperAdmin.value && edit && r) {
    await initEdit()
  }
})

const saving = ref(false)
const saveError = ref('')

const save = async () => {
  if (isSuperAdmin.value) return
  saving.value = true
  saveError.value = ''
  try {
    const payload = {
      name: name.value || undefined,
      description: description.value || undefined,
      permissionIds: selectedPermissionIds.value || [],
    }

    await $api(`/roles/${id.value}`, { method: 'PATCH', body: payload })
    router.replace({ name: 'role-model-id', params: { id: id.value } })
    await reload()
  } catch (e) {
    saveError.value = e?.data?.message || 'Falha ao guardar'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-3">
        <span>Nível de acesso</span>
        <VChip color="primary" size="small">{{ role?.name || '-' }}</VChip>
      </div>
      <div class="d-flex gap-2">
        <VBtn color="primary" variant="tonal" :disabled="isSuperAdmin" @click="startEdit">
          <VIcon icon="tabler-pencil" class="me-1" /> Editar
        </VBtn>
      </div>
    </VCardTitle>
    <VCardText>
      <VProgressLinear v-if="isFetching" indeterminate class="mb-4" />
      <VAlert v-if="error" type="error" variant="tonal" class="mb-4">{{ (error && error.message) || 'Falha ao carregar' }}</VAlert>

      <VRow v-if="!isEdit">
        <VCol cols="12" md="6">
          <VCard variant="tonal">
            <VCardTitle>Detalhes</VCardTitle>
            <VCardText>
              <div>Nome: {{ role?.name }}</div>
              <div>Descrição: {{ role?.description || '-' }}</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="6">
          <VCard variant="tonal">
            <VCardTitle>Estatísticas</VCardTitle>
            <VCardText>
              <div>Utilizadores: {{ (role?.users || []).length }}</div>
              <div>Permissões: {{ (role?.permissions || []).length }}</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow v-if="!isEdit">
        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle>Permissões</VCardTitle>
            <VCardText>
              <VTable density="comfortable">
                <thead>
                  <tr>
                    <th>Recurso</th>
                    <th>Ação</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rp in (role?.permissions || [])" :key="rp.id || rp.permission?.id">
                    <td>{{ rp?.permission?.resource || '-' }}</td>
                    <td>{{ rp?.permission?.action || '-' }}</td>
                    <td>{{ rp?.permission?.description || '-' }}</td>
                  </tr>
                  <tr v-if="!(role?.permissions || []).length">
                    <td colspan="3" class="text-center text-medium-emphasis">Nenhuma permissão</td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle>Utilizadores</VCardTitle>
            <VCardText>
              <VTable density="comfortable">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in (role?.users || [])" :key="u.id">
                    <td>{{ u.name }}</td>
                    <td>{{ u.email }}</td>
                  </tr>
                  <tr v-if="!(role?.users || []).length">
                    <td colspan="2" class="text-center text-medium-emphasis">Nenhum usuário</td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow v-else>
        <VCol cols="12" md="6">
          <VTextField v-model="name" label="Nome" :disabled="isSuperAdmin" />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField v-model="description" label="Descrição" />
        </VCol>
        <VCol cols="12">
          <VCard>
            <VCardTitle>Permissões</VCardTitle>
            <VCardText>
              <div class="mb-2 text-medium-emphasis">Selecione as permissões deste nível de acesso</div>
              <VRow>
                <VCol cols="12" md="6" v-for="p in allPermissions" :key="p.id">
                  <VCheckbox
:model-value="selectedPermissionIds.includes(String(p.id))" @update:model-value="val => {
                    const pid = String(p.id)
                    const idx = selectedPermissionIds.indexOf(pid)
                    if (val && idx < 0) selectedPermissionIds.push(pid)
                    else if (!val && idx >= 0) selectedPermissionIds.splice(idx, 1)
                  }" :label="`${p.resource} :: ${p.action}`" />
                  <div class="text-caption text-medium-emphasis">{{ p.description }}</div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" class="d-flex justify-end gap-2">
          <VBtn variant="text" @click="router.replace({ name: 'role-model-id', params: { id: id.value } })">Cancelar</VBtn>
          <VBtn color="primary" :loading="saving" :disabled="isSuperAdmin" @click="save">Guardar</VBtn>
        </VCol>
        <VCol cols="12">
          <VAlert v-if="saveError" type="error" variant="tonal">{{ saveError }}</VAlert>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
