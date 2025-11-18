<script setup>
import { ref, watchEffect } from 'vue'
import { $api } from '@/utils/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const empresas = ref([])
const loading = ref(false)
const errorMsg = ref('')

// Filtros e paginação
const status = ref('active')
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const meta = ref({ total: 0, page: 1, limit: 10, totalPages: 1 })

const formatDateTime = d => (d ? new Date(d).toLocaleString() : '-')

const fetchEmpresas = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const qs = new URLSearchParams()

    qs.set('page', String(page.value))
    qs.set('limit', String(itemsPerPage.value))
    qs.set('status', status.value)
    if (search.value && search.value.trim()) qs.set('search', search.value.trim())

    const resp = await $api(`/empresas?${qs.toString()}`)
    const data = resp?.data ?? resp

    empresas.value = Array.isArray(data) ? data : (data?.data ?? [])
    meta.value = Array.isArray(data) ? { total: data.length, page: page.value, limit: itemsPerPage.value, totalPages: 1 } : (data?.meta ?? meta.value)
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao carregar empresas'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Recarrega ao alterar qualquer filtro/paginação
watchEffect(() => {
  // Dependências para triggering
  status.value; page.value; itemsPerPage.value; search.value
  fetchEmpresas()
})

const deleteDialog = ref(false)
const deleting = ref(false)
const deletingEmpresa = ref(null)
const restoring = ref(false)
const restoringEmpresa = ref(null)

const askDelete = emp => {
  deletingEmpresa.value = emp
  deleteDialog.value = true
}

const deleteEmpresa = async () => {
  if (!deletingEmpresa.value) return
  try {
    deleting.value = true
    await $api(`/empresas/${deletingEmpresa.value.id}`, { method: 'DELETE' })
    deleteDialog.value = false
    deletingEmpresa.value = null

    // Se eliminar enquanto está em "Ativas", atualiza listagem para refletir
    await fetchEmpresas()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao eliminar empresa'
    console.error(err)
  } finally {
    deleting.value = false
  }
}

const restoreEmpresa = async emp => {
  if (!emp?.id) return
  try {
    restoring.value = true
    restoringEmpresa.value = emp
    await $api(`/empresas/${emp.id}/restore`, { method: 'PATCH' })
    await fetchEmpresas()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao restaurar empresa'
    console.error(err)
  } finally {
    restoring.value = false
    restoringEmpresa.value = null
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Empresas</span>
      <VBtn color="primary" @click="router.push({ name: 'empresa-adicionar' })">
        <VIcon icon="tabler-plus" class="me-2" />Adicionar
      </VBtn>
    </VCardTitle>

    <VCardText>
      <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>

      <div class="d-flex align-center flex-wrap gap-3 mb-4">
        <VTabs v-model="status">
          <VTab value="active">Ativas</VTab>
          <VTab value="deleted">Eliminadas</VTab>
        </VTabs>
        <VTextField
          v-model="search"
          placeholder="Pesquisar empresa"
          density="comfortable"
          hide-details
          clearable
          prepend-inner-icon="tabler-search"
          class="ms-4"
          style="min-width: 320px; width: clamp(320px, 40vw, 640px)"
        />
      </div>

      <template v-if="loading">
        <div class="py-6 d-flex justify-center">
          <VProgressCircular indeterminate color="primary" />
        </div>
      </template><template v-else>
        <VTable density="comfortable">
          <thead>
            <tr>
              <th>Nome Social</th>
              <th>NIF</th>
              <th>Email</th>
              <th>Criado em</th>
              <th>Atualizado em</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in empresas" :key="emp.id">
              <td>{{ emp.nomeSocial }}</td>
              <td>{{ emp.nif }}</td>
              <td>{{ emp.email || '-' }}</td>
              <td>{{ formatDateTime(emp.createdAt) }}</td>
              <td>{{ formatDateTime(emp.updatedAt) }}</td>
              <td class="text-end">
                <VBtn size="small" variant="text" color="primary" @click="router.push({ name: 'empresa-id', params: { id: emp.id } })">
                  <VIcon icon="tabler-eye" class="me-1" />
                </VBtn>
                <!-- Mostrar Eliminar apenas em Ativas -->
                <VBtn v-if="status === 'active'" size="small" variant="text" color="error" @click="askDelete(emp)">
                  <VIcon icon="tabler-trash" class="me-1" />
                </VBtn>
                <!-- Mostrar Reciclar apenas em Eliminadas -->
                <VBtn
                  v-else-if="status === 'deleted'"
                  size="small"
                  variant="text"
                  color="success"
                  :loading="restoring && restoringEmpresa?.id === emp.id"
                  @click="restoreEmpresa(emp)"
                >
                  <VIcon icon="tabler-recycle" class="me-1" />
                </VBtn>
              </td>
            </tr>
            <tr v-if="empresas.length === 0">
              <td colspan="6" class="text-center text-medium-emphasis">Nenhuma empresa encontrada</td>
            </tr>
          </tbody>
        </VTable>

        <div class="d-flex align-center justify-space-between mt-4">
          <div class="d-flex align-center gap-3">
            <span class="text-caption">Total: {{ meta.total }}</span>
            <VSelect
              v-model="itemsPerPage"
              :items="[5,10,15,20,30]"
              label="Itens por página"
              density="comfortable"
              hide-details
              style="max-width: 180px"
            />
          </div>
          <VPagination
            v-model="page"
            :length="meta.totalPages"
            density="comfortable"
          />
        </div>
      </template>
    </VCardText>
  </VCard>

  <VDialog v-model="deleteDialog" max-width="420">
    <VCard>
      <VCardTitle>Remover empresa</VCardTitle>
      <VCardText>
        Tem certeza que deseja eliminar a empresa "{{ deletingEmpresa?.nomeSocial }}"? Esta ação não pode ser desfeita.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" :loading="deleting" @click="deleteEmpresa">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
