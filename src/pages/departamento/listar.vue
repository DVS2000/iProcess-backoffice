<script setup>
import { ref, watchEffect } from 'vue'
import { $api } from '@/utils/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const departamentos = ref([])
const loading = ref(false)
const errorMsg = ref('')

// Filtros e paginação
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const meta = ref({ total: 0, page: 1, limit: 10, totalPages: 1 })

const formatDateTime = d => (d ? new Date(d).toLocaleString() : '-')

const fetchDepartamentos = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const qs = new URLSearchParams()

    qs.set('page', String(page.value))
    qs.set('limit', String(itemsPerPage.value))
    if (search.value && search.value.trim()) qs.set('search', search.value.trim())

    const resp = await $api(`/departamentos?${qs.toString()}`)
    const data = resp?.data ?? resp

    departamentos.value = Array.isArray(data) ? data : (data?.data ?? [])
    meta.value = Array.isArray(data) ? { total: data.length, page: page.value, limit: itemsPerPage.value, totalPages: 1 } : (data?.meta ?? meta.value)
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao carregar departamentos'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Recarrega ao alterar qualquer filtro/paginação
watchEffect(() => {
  page.value; itemsPerPage.value; search.value
  fetchDepartamentos()
})

const deleteDialog = ref(false)
const deleting = ref(false)
const deletingDepartamento = ref(null)

const askDelete = dep => {
  deletingDepartamento.value = dep
  deleteDialog.value = true
}

const deleteDepartamento = async () => {
  if (!deletingDepartamento.value) return
  try {
    deleting.value = true
    await $api(`/departamentos/${deletingDepartamento.value.id}`, { method: 'DELETE' })
    deleteDialog.value = false
    deletingDepartamento.value = null
    await fetchDepartamentos()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao eliminar departamento'
    console.error(err)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Departamentos</span>
      <VBtn color="primary" @click="router.push({ name: 'departamento-adicionar' })">
        <VIcon icon="tabler-plus" class="me-2" />Adicionar
      </VBtn>
    </VCardTitle>

    <VCardText>
      <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>

      <div class="d-flex align-center flex-wrap gap-3 mb-4">
        <VTextField
          v-model="search"
          placeholder="Pesquisar departamento"
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
              <th>Nome</th>
              <th>Descrição</th>
              <th>Empresa</th>
              <th>Chefe</th>
              <th>Contacto</th>
              <th>Criado em</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dep in departamentos" :key="dep.id">
              <td>{{ dep.nome }}</td>
              <td>{{ dep.descricao || '-' }}</td>
              <td>{{ dep.empresa?.nomeSocial || '-' }}</td>
              <td>{{ dep.chefe?.name || '-' }}</td>
              <td>{{ dep.contacto || '-' }}</td>
              <td>{{ formatDateTime(dep.createdAt) }}</td>
              <td class="text-end">
                <VBtn size="small" variant="text" color="primary" @click="router.push({ name: 'departamento-id', params: { id: dep.id } })">
                  <VIcon icon="tabler-eye" class="me-1" />
                </VBtn>
                <VBtn size="small" variant="text" color="error" @click="askDelete(dep)">
                  <VIcon icon="tabler-trash" class="me-1" />
                </VBtn>
              </td>
            </tr>
            <tr v-if="departamentos.length === 0">
              <td colspan="6" class="text-center text-medium-emphasis">Nenhum departamento encontrado</td>
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
      <VCardTitle>Remover departamento</VCardTitle>
      <VCardText>
        Tem certeza que deseja eliminar o departamento "{{ deletingDepartamento?.nome }}"? Esta ação não pode ser desfeita.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" :loading="deleting" @click="deleteDepartamento">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
