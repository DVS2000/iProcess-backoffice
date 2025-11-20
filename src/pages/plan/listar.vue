<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { createUrl } from '@/@core/composable/createUrl'

const router = useRouter()

// Table state
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const isActive = ref()

// Fetch plans with reactive query params
const { data, execute: fetchPlans, isFetching, error } = await useApi(createUrl('/plans', {
  query: { page, limit: itemsPerPage, search, isActive },
}))

const plans = computed(() => data.value?.data?.data || [])
const totalItems = computed(() => data.value?.data?.pagination?.total || 0)

// Columns
const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Preço', key: 'price' },
  { title: 'Ciclo', key: 'billingCycle' },
  { title: 'Ativo', key: 'isActive' },
  { title: 'Ações', key: 'actions', sortable: false },
]

// Helpers
const formatCurrency = plan => {
  const currency = plan.currency || 'AOA'
  try {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(Number(plan.price || 0))
  } catch (e) {
    return `${plan.price ?? 0} ${currency}`
  }
}

// Actions
const visualizar = plan => router.push({ name: 'plan-id', params: { id: plan.id } })
const editar = plan => router.push({ name: 'plan-id', params: { id: plan.id }, query: { edit: 'true' } })

const { patch } = useApi('/plans')

const confirmDialog = ref(false)
const confirmAction = ref('')
const confirmId = ref('')

const askActivate = plan => { confirmId.value = plan.id; confirmAction.value = 'activate'; confirmDialog.value = true }
const askDeactivate = plan => { confirmId.value = plan.id; confirmAction.value = 'deactivate'; confirmDialog.value = true }

const onConfirm = async () => {
  try {
    if (!confirmId.value) return
    if (confirmAction.value === 'activate') await patch(`/plans/${confirmId.value}/activate`)
    else if (confirmAction.value === 'deactivate') await patch(`/plans/${confirmId.value}/deactivate`)
    confirmDialog.value = false
    confirmId.value = ''
    confirmAction.value = ''
    await fetchPlans()
  } catch (err) { console.error(err) }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center flex-wrap gap-4">
      <span>Planos</span>
      <VBtn color="primary" :to="{ name: 'plan-adicionar' }">
        <VIcon icon="tabler-plus" start />
        Adicionar Plano
      </VBtn>
    </VCardTitle>

    <VDivider />

    <VCardText>
      <div class="d-flex flex-wrap gap-4 align-center">
        <AppTextField v-model="search" placeholder="Pesquisar por nome" style="max-inline-size: 300px; min-inline-size: 300px;" />
        <VSelect
          v-model="isActive"
          :items="[
            { title: 'Todos', value: undefined },
            { title: 'Ativos', value: true },
            { title: 'Inativos', value: false },
          ]"
          label="Status"
          style="max-inline-size: 200px; min-inline-size: 200px;"
        />
      </div>
    </VCardText>

    <VDivider />

    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :items="plans"
      :items-length="totalItems"
      :loading="isFetching"
      :headers="headers"
      class="text-no-wrap"
    >
      <template #item.price="{ item }">
        {{ formatCurrency(item) }}
      </template>

      <template #item.billingCycle="{ item }">
        <VChip :color="item.billingCycle === 'MONTHLY' ? 'secondary' : 'primary'" size="small">
          {{ item.billingCycle === 'MONTHLY' ? 'Mensal' : 'Anual' }}
        </VChip>
      </template>

      <template #item.isActive="{ item }">
        <VChip :color="item.isActive ? 'success' : 'error'" size="small">
          {{ item.isActive ? 'Ativo' : 'Inativo' }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex align-center gap-2">
          <IconBtn :to="{ name: 'plan-id', params: { id: item.id } }" color="secondary">
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn :to="{ name: 'plan-id', params: { id: item.id }, query: { edit: 'true' } }" color="primary">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <VMenu>
            <template #activator="{ props }">
              <IconBtn v-bind="props">
                <VIcon icon="tabler-dots-vertical" />
              </IconBtn>
            </template>
            <VList>
              <VListItem @click="item.isActive ? askDeactivate(item) : askActivate(item)">
                <template #prepend>
                  <VIcon :icon="item.isActive ? 'tabler-pause' : 'tabler-play'" />
                </template>
                <VListItemTitle>{{ item.isActive ? 'Desativar' : 'Ativar' }}</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </div>
      </template>

      <template #bottom>
        <TablePagination
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :total-items="totalItems"
        />
      </template>
    </VDataTableServer>
  </VCard>

  <VDialog v-model="confirmDialog" max-width="500">
    <VCard>
      <VCardTitle>{{ confirmAction === 'activate' ? 'Ativar plano?' : 'Desativar plano?' }}</VCardTitle>
      <VCardText>Confirma executar esta ação?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="confirmDialog = false">Cancelar</VBtn>
        <VBtn color="primary" @click="onConfirm">Confirmar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
