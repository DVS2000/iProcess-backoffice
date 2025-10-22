<script setup>
import { ref, watchEffect, watch } from 'vue'
import { useRouter } from 'vue-router'
import { $api } from '@/utils/api'

const router = useRouter()

const tab = ref('ativos')
const showDeleted = ref(false)
watchEffect(() => { showDeleted.value = (tab.value === 'excluidos') })

const search = ref('')
const role = ref('')
const itemsPerPage = ref(10)
const page = ref(1)

const users = ref([])
const meta = ref({ total: 0, page: 1, limit: 10, totalPages: 1 })
const loading = ref(false)
const errorMsg = ref('')

const roleOptions = ['ADMIN', 'USER']

const fetchUsers = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const qs = new URLSearchParams()

    qs.set('page', page.value)

    qs.set('limit', itemsPerPage.value)
    if (search.value && search.value.trim()) qs.set('search', search.value.trim())
    if (role.value) qs.set('role', role.value)
    const endpoint = showDeleted.value ? '/user/deleted' : '/user'
    const resp = await $api(`${endpoint}?${qs.toString()}`)
    const data = resp?.data ?? resp

    users.value = Array.isArray(data) ? data : (data?.data ?? [])
    meta.value = data?.meta || data?.pagination || meta.value
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao carregar usuários'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watchEffect(() => { page.value; itemsPerPage.value; search.value; role.value; showDeleted.value; fetchUsers() })

const deleteDialog = ref(false)
const deleting = ref(false)
const toDeleteId = ref('')

const askDelete = (id) => { toDeleteId.value = id; deleteDialog.value = true }

const deleteUser = async () => {
  if (!toDeleteId.value) return
  try {
    deleting.value = true
    await $api(`/user/${toDeleteId.value}`, { method: 'DELETE' })
    deleteDialog.value = false
    toDeleteId.value = ''
    await fetchUsers()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao eliminar usuário'
    console.error(err)
  } finally {
    deleting.value = false
  }
}

const restoreUser = async (id) => {
  try {
    await $api(`/user/${id}/restore`, { method: 'PATCH' })
    await fetchUsers()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao restaurar usuário'
    console.error(err)
  }
}

const goDetail = (u) => router.push({ name: 'user-id', params: { id: u.id } })
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Usuários</span>
          <div class="d-flex align-center gap-3">
            <VTabs v-model="tab" density="comfortable" color="primary">
              <VTab value="ativos">Ativos</VTab>
              <VTab value="excluidos">Excluídos</VTab>
            </VTabs>
            <VBtn color="primary" :to="{ name: 'user-adicionar' }">
              <VIcon icon="tabler-user-plus" class="me-2" />Adicionar
            </VBtn>
          </div>
        </VCardTitle>
        <VCardText>
          <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>

          <div class="d-flex align-center gap-3 mb-4">
            <VTextField v-model="search" label="Pesquisar" clearable density="comfortable" style="max-width: 280px" />
            <VSelect v-model="role" :items="roleOptions" label="Role" clearable density="comfortable" style="max-width: 200px" />
            <VSelect v-model="itemsPerPage" :items="[5,10,15,20,30]" label="Itens por página" density="comfortable" style="max-width: 180px" />
          </div>

          <template v-if="loading">
            <div class="py-6 d-flex justify-center"><VProgressCircular indeterminate color="primary" /></div>
          </template><template v-else>
            <VTable density="comfortable">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Departamento</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users" :key="u.id">
                  <td>{{ u.name }}</td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.role }}</td>
                  <td>
                    <VChip :color="u.status === 'ACTIVE' ? 'success' : 'error'" size="small" variant="tonal">
                      {{ u.status }}
                    </VChip>
                  </td>
                  <td>{{ u.departamento?.nome || '-' }}</td>
                  <td class="text-end">
                    <VBtn size="small" variant="text" color="info" @click="goDetail(u)">
                      <VIcon icon="tabler-eye" class="me-1" /> Ver
                    </VBtn>
                    <VBtn
                      size="small"
                      variant="text"
                      :color="showDeleted ? 'success' : 'error'"
                      @click="showDeleted ? restoreUser(u.id) : askDelete(u.id)"
                    >
                      <VIcon :icon="showDeleted ? 'tabler-restore' : 'tabler-trash'" class="me-1" />
                      {{ showDeleted ? 'Restaurar' : 'Eliminar' }}
                    </VBtn>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="6" class="text-center text-medium-emphasis">Nenhum usuário encontrado</td>
                </tr>
              </tbody>
            </VTable>

            <div class="d-flex align-center justify-space-between mt-4">
              <span class="text-caption">Total: {{ meta.total }}</span>
              <VPagination v-model="page" :length="meta.totalPages" density="comfortable" />
            </div>
          </template>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog v-model="deleteDialog" max-width="420">
    <VCard>
      <VCardTitle>Eliminar usuário</VCardTitle>
      <VCardText>Tem certeza que deseja eliminar este usuário?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" :loading="deleting" @click="deleteUser">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
