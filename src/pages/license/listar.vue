<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
import { $api } from '@/utils/api'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const refreshKey = ref(0)
const refresh = () => { refreshKey.value++ }

const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmAction = ref('')
const confirmItem = ref(null)

const ask = (action, item) => {
  confirmItem.value = item
  confirmAction.value = action
  confirmTitle.value = action === 'activate' ? 'Ativar licença?' : action === 'suspend' ? 'Suspender licença?' : 'Cancelar licença?'
  confirmDialog.value = true
}

const doActivate = async item => { await $api(`/licenses/${item.id}/activate`, { method: 'PATCH', body: { reason: 'backoffice' } }); refresh() }
const doSuspend = async item => { await $api(`/licenses/${item.id}/suspend`, { method: 'PATCH', body: { reason: 'backoffice' } }); refresh() }
const doCancel = async item => { await $api(`/licenses/${item.id}/cancel`, { method: 'PATCH', body: { reason: 'backoffice' } }); refresh() }

const onConfirm = async () => {
  if (!confirmItem.value) { confirmDialog.value = false 

    return }
  if (confirmAction.value === 'activate') await doActivate(confirmItem.value)
  else if (confirmAction.value === 'suspend') await doSuspend(confirmItem.value)
  else if (confirmAction.value === 'cancel') await doCancel(confirmItem.value)
  confirmDialog.value = false
}

const renewDialog = ref(false)
const renewItem = ref(null)
const renewForm = ref({ newEndDate: '', paymentReference: '', paymentDate: '' })
const openRenew = item => { renewItem.value = item; renewForm.value = { newEndDate: '', paymentReference: '', paymentDate: '' }; renewDialog.value = true }

const confirmRenew = async () => {
  if (!renewItem.value) return
  await $api(`/licenses/${renewItem.value.id}/renew`, { method: 'PATCH', body: renewForm.value })
  renewDialog.value = false
  refresh()
}

const onView = item => router.push({ name: 'license-id', params: { id: item.id } })
const onEdit = item => router.push({ name: 'license-id', params: { id: item.id }, query: { edit: '1' } })

const empresas = ref([])
const plans = ref([])
const empresaOptions = ref([])
const planOptions = ref([])

const statusOptions = [
  { label: 'Ativa', value: 'ACTIVE' },
  { label: 'Inativa', value: 'INACTIVE' },
  { label: 'Suspensa', value: 'SUSPENDED' },
  { label: 'Cancelada', value: 'CANCELLED' },
]

const loadEmpresas = async () => {
  try {
    const qs = new URLSearchParams()

    qs.set('page', '1')
    qs.set('limit', '100')

    const resp = await $api(`/empresas?${qs.toString()}`)
    const data = resp?.data ?? resp

    empresas.value = Array.isArray(data) ? data : (data?.data ?? [])
    empresaOptions.value = empresas.value.map(e => ({ label: e.nomeSocial || e.name || e.id, value: e.id }))
  } catch (err) {}
}

const loadPlans = async () => {
  try {
    const qs = new URLSearchParams()

    qs.set('page', '1')
    qs.set('limit', '100')

    const resp = await $api(`/plans?${qs.toString()}`)
    const data = resp?.data ?? resp

    plans.value = Array.isArray(data) ? data : (data?.data ?? [])
    planOptions.value = plans.value.map(p => ({ label: p.name || p.title || p.id, value: p.id }))
  } catch (err) {}
}

await loadEmpresas()
await loadPlans()

const preSaveLicense = async (form, editing) => {
  if (editing?.id) {
    const payload = {
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: form.status || undefined,
      paymentReference: form.paymentReference || undefined,
      paymentDate: form.paymentDate || undefined,
      metadata: form.metadata || undefined,
    }

    
    return payload
  }
  const empresaId = form.empresaId
  const planId = form.planId
  if (!empresaId || !planId || !form.status || !form.endDate) {
    throw { data: { message: 'Preencha Empresa, Plano e Estado' } }
  }
  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED'].includes(form.status)) {
    throw { data: { message: 'Estado inválido' } }
  }
  if (form.startDate && form.endDate) {
    const sd = new Date(form.startDate)
    const ed = new Date(form.endDate)
    if (sd instanceof Date && ed instanceof Date && !isNaN(sd) && !isNaN(ed) && sd > ed) {
      throw { data: { message: 'Data de início deve ser anterior à de expiração' } }
    }
  }

  let list = []
  try {
    const r1 = await $api(`/licenses/empresa/${empresaId}`)
    const d1 = r1?.data ?? r1

    list = Array.isArray(d1) ? d1 : (d1?.data ?? [])
  } catch {}
  if (!Array.isArray(list) || !list.length) {
    try {
      const qs = new URLSearchParams()

      qs.set('page', '1')
      qs.set('limit', '100')
      qs.set('empresaId', String(empresaId))

      const r2 = await $api(`/license?${qs.toString()}`)
      const d2 = r2?.data ?? r2

      list = Array.isArray(d2) ? d2 : (d2?.data ?? [])
    } catch {}
  }

  const duplicate = list.some(l => (l?.plan?.id || l?.planId) === planId && l?.status !== 'CANCELLED')
  if (duplicate) throw { data: { message: 'Empresa já possui licença com este plano' } }

  const newPlan = plans.value.find(p => p.id === planId)
  const active = list.filter(l => l?.status === 'ACTIVE')
  if (newPlan && active.length) {
    const lower = active.find(l => {
      const lp = plans.value.find(p => p.id === (l?.plan?.id || l?.planId))
      
      return lp && Number(lp.price || 0) < Number(newPlan.price || 0)
    })

    if (lower) {
      try { await $api(`/licenses/${lower.id}/cancel`, { method: 'PATCH', body: { reason: 'upgrade' } }) } catch {}
    }
  }

  const payload = {
    empresaId,
    planId,
    startDate: form.startDate || undefined,
    endDate: form.endDate,
    status: form.status,
    paymentReference: form.paymentReference || undefined,
    paymentDate: form.paymentDate || undefined,
    metadata: form.metadata || undefined,
  }

  
  return payload
}
</script>

<template>
  <CrudPage
    resource="/license"
    :refresh-key="refreshKey"
    title="Licenças"
    :custom-cells="['status']"
    :pre-save="preSaveLicense"
    create-endpoint="/licenses"
    update-endpoint="/licenses"
    :fields="[
      { key: 'empresa.nomeSocial', label: 'Empresa' },
      { key: 'plan.name', label: 'Plano' },
      { key: 'startDate', label: 'Início', type: 'date' },
      { key: 'endDate', label: 'Expira em', type: 'date' },
      { key: 'status', label: 'Estado' },
    ]"
    :actions="{ view: true, edit: true, delete: false, custom: [
      { key: 'activate', label: 'Ativar', icon: 'tabler-power', color: 'success', handler: item => ask('activate', item) },
      { key: 'suspend', label: 'Suspender', icon: 'tabler-player-pause', color: 'warning', handler: item => ask('suspend', item) },
      { key: 'cancel', label: 'Cancelar', icon: 'tabler-ban', color: 'error', handler: item => ask('cancel', item) },
      { key: 'renew', label: 'Renovar', icon: 'tabler-refresh', color: 'info', handler: openRenew },
    ] }"
    @view="onView"
  >
    <template #form-fields="{ form, editing }">
      <VCol cols="12" md="6">
        <VSelect v-if="!editing" v-model="form.empresaId" :items="empresaOptions" item-title="label" item-value="value" label="Empresa" required />
        <VTextField v-else :model-value="form?.empresa?.nomeSocial || form?.empresa?.name || form?.empresaId || '-'" label="Empresa" disabled />
      </VCol>
      <VCol cols="12" md="6">
        <VSelect v-if="!editing" v-model="form.planId" :items="planOptions" item-title="label" item-value="value" label="Plano" required />
        <VTextField v-else :model-value="form?.plan?.name || form?.planId || '-'" label="Plano" disabled />
      </VCol>
      <VCol cols="12" md="6">
        <VSelect v-model="form.status" :items="statusOptions" item-title="label" item-value="value" label="Estado" required />
      </VCol>
      <VCol cols="12" md="6">
        <VTextField v-model="form.startDate" label="Início" type="datetime-local" />
      </VCol>
      <VCol cols="12" md="6">
        <VTextField v-model="form.endDate" label="Expira em" type="datetime-local" />
      </VCol>
      <VCol cols="12" md="6">
        <VTextField v-model="form.paymentReference" label="Referência de Pagamento" />
      </VCol>
      <VCol cols="12" md="6">
        <VTextField v-model="form.paymentDate" label="Data de Pagamento" type="datetime-local" />
      </VCol>
    </template>
    <template #item.status="{ item }">
      <VChip :color="item.status === 'ACTIVE' ? 'success' : item.status === 'SUSPENDED' ? 'warning' : item.status === 'CANCELLED' ? 'error' : 'secondary'" size="small" class="text-uppercase">{{ ({ACTIVE:'ATIVA',EXPIRED:'EXPIRADA',SUSPENDED:'SUSPENSA',CANCELLED:'CANCELADA'})[item.status] || item.status }}</VChip>
    </template>
  </CrudPage>
  <VDialog v-model="confirmDialog" max-width="420">
    <VCard>
      <VCardTitle>{{ confirmTitle }}</VCardTitle>
      <VCardText>
        Esta ação altera o estado da licença. Deseja continuar?
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="confirmDialog = false">Cancelar</VBtn>
        <VBtn color="primary" @click="onConfirm">Confirmar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
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
