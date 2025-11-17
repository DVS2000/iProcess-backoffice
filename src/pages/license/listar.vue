<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
import { $api } from '@/utils/api'
import { useRouter } from 'vue-router'

const router = useRouter()

import { ref } from 'vue'

const activate = async (item) => { await $api(`/licenses/${item.id}/activate`, { method: 'PATCH', body: { reason: 'backoffice' } }); refresh() }
const suspend = async (item) => { await $api(`/licenses/${item.id}/suspend`, { method: 'PATCH', body: { reason: 'backoffice' } }); refresh() }
const cancel = async (item) => { await $api(`/licenses/${item.id}/cancel`, { method: 'PATCH', body: { reason: 'backoffice' } }); refresh() }

const renewDialog = ref(false)
const renewItem = ref(null)
const renewForm = ref({ newEndDate: '', paymentReference: '', paymentDate: '' })
const openRenew = (item) => { renewItem.value = item; renewForm.value = { newEndDate: '', paymentReference: '', paymentDate: '' }; renewDialog.value = true }
const confirmRenew = async () => {
  if (!renewItem.value) return
  await $api(`/licenses/${renewItem.value.id}/renew`, { method: 'PATCH', body: renewForm.value })
  renewDialog.value = false
}

const onView = (item) => router.push({ name: 'license-id', params: { id: item.id } })
const onEdit = (item) => router.push({ name: 'license-id', params: { id: item.id }, query: { edit: '1' } })
</script>

<template>
  <CrudPage
    resource="/license"
    :refresh-key="refreshKey"
    title="Licenças"
    :fields="[
      { key: 'empresa.nomeSocial', label: 'Empresa' },
      { key: 'plan.name', label: 'Plano' },
      { key: 'startDate', label: 'Início', type: 'date' },
      { key: 'endDate', label: 'Expira em', type: 'date' },
      { key: 'status', label: 'Status' },
    ]"
    :actions="{ view: true, edit: true, delete: false, custom: [
      { key: 'activate', label: 'Ativar', icon: 'tabler-power', color: 'success', handler: activate },
      { key: 'suspend', label: 'Suspender', icon: 'tabler-player-pause', color: 'warning', handler: suspend },
      { key: 'cancel', label: 'Cancelar', icon: 'tabler-ban', color: 'error', handler: cancel },
      { key: 'renew', label: 'Renovar', icon: 'tabler-refresh', color: 'info', handler: openRenew },
    ] }"
    @view="onView"
    @edit="onEdit"
  >
    <template #item.status="{ item }">
      <VChip :color="item.status === 'ACTIVE' ? 'success' : item.status === 'SUSPENDED' ? 'warning' : item.status === 'CANCELLED' ? 'error' : 'secondary'" size="small" class="text-uppercase">{{ ({ACTIVE:'ATIVA',EXPIRED:'EXPIRADA',SUSPENDED:'SUSPENSA',CANCELLED:'CANCELADA'})[item.status] || item.status }}</VChip>
    </template>
    <template #add-button>
      <VBtn color="primary" @click="() => router.push({ name: 'license-adicionar' })">Adicionar</VBtn>
    </template>
  </CrudPage>
  <VDialog v-model="renewDialog" max-width="520">
    <VCard>
      <VCardTitle>Renovar Licença</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField v-model="renewForm.newEndDate" type="datetime-local" label="Nova data de expiração" required />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="renewForm.paymentReference" label="Referência de Pagamento" />
          </VCol>
          <VCol cols="12">
            <VTextField v-model="renewForm.paymentDate" type="datetime-local" label="Data do Pagamento" />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="renewDialog = false">Fechar</VBtn>
        <VBtn color="primary" @click="confirmRenew">Confirmar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
const refreshKey = ref(0)
const refresh = () => { refreshKey.value++ }
