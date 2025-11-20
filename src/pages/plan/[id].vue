<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const editMode = ref(route.query.edit === 'true')

const { data, execute: fetchPlan, isFetching, error } = await useApi(`/plans/${id}`)
const plan = ref(null)

const form = ref({
  name: '',
  description: '',
  price: 0,
  currency: 'AOA',
  billingCycle: 'MONTHLY',
  isActive: true,
  maxUsers: null,
  maxProcesses: null,
  maxWorkflows: null,
  maxStorage: null,
  maxDocuments: null,
})

watch(data, () => {
  plan.value = data.value?.data || null
  if (plan.value) {
    form.value = {
      name: plan.value.name || '',
      description: plan.value.description || '',
      price: plan.value.price ?? 0,
      currency: plan.value.currency || 'AOA',
      billingCycle: plan.value.billingCycle || 'MONTHLY',
      isActive: !!plan.value.isActive,
      maxUsers: plan.value.maxUsers ?? null,
      maxProcesses: plan.value.maxProcesses ?? null,
      maxWorkflows: plan.value.maxWorkflows ?? null,
      maxStorage: plan.value.maxStorage != null ? Number(plan.value.maxStorage) / 1024 : null,
      maxDocuments: plan.value.maxDocuments ?? null,
    }
  }
}, { immediate: true })

const saving = ref(false)
const errorMsg = ref('')

const save = async () => {
  try {
    saving.value = true
    errorMsg.value = ''

    const payload = {
      ...form.value,
      currency: 'AOA',
      billingCycle: 'MONTHLY',
      price: Number(form.value.price || 0),
      maxUsers: form.value.maxUsers != null ? Number(form.value.maxUsers) : undefined,
      maxProcesses: form.value.maxProcesses != null ? Number(form.value.maxProcesses) : undefined,
      maxWorkflows: form.value.maxWorkflows != null ? Number(form.value.maxWorkflows) : undefined,
      maxStorage: form.value.maxStorage != null ? Math.round(Number(form.value.maxStorage) * 1024) : undefined,
      maxDocuments: form.value.maxDocuments != null ? Number(form.value.maxDocuments) : undefined,
    }

    await $api(`/plans/${id}`, { method: 'PATCH', body: payload })
    editMode.value = false
    await fetchPlan()
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || 'Falha ao salvar plano'
  } finally {
    saving.value = false
  }
}

const ativar = async () => {
  try {
    await $api(`/plans/${id}/activate`, { method: 'PATCH' })
    await fetchPlan()
  } catch (err) {
    console.error(err)
  }
}

const desativar = async () => {
  try {
    await $api(`/plans/${id}/deactivate`, { method: 'PATCH' })
    await fetchPlan()
  } catch (err) {
    console.error(err)
  }
}

const confirmDialog = ref(false)
const confirmAction = ref('')
const askActivate = () => { confirmAction.value = 'activate'; confirmDialog.value = true }
const askDeactivate = () => { confirmAction.value = 'deactivate'; confirmDialog.value = true }

const onConfirm = async () => {
  try {
    if (confirmAction.value === 'activate') await ativar()
    else if (confirmAction.value === 'deactivate') await desativar()
    confirmDialog.value = false
    confirmAction.value = ''
  } catch (err) { console.error(err) }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-4">
      <span>Plano {{ plan?.name ? `- ${plan.name}` : '' }}</span>
      <div class="d-flex gap-2">
        <VBtn variant="tonal" color="secondary" :to="{ name: 'plan-listar' }">Voltar</VBtn>
        <VBtn v-if="!editMode" color="primary" @click="editMode = true">
          <VIcon icon="tabler-pencil" start />
          Editar
        </VBtn>
        <VBtn v-else color="primary" :loading="saving" @click="save">
          <VIcon icon="tabler-device-floppy" start />
          Salvar
        </VBtn>
        <VBtn v-if="plan?.isActive" color="warning" variant="tonal" @click="askDeactivate">
          <VIcon icon="tabler-pause" start />
          Desativar
        </VBtn>
        <VBtn v-else color="success" variant="tonal" @click="askActivate">
          <VIcon icon="tabler-play" start />
          Ativar
        </VBtn>
      </div>
    </VCardTitle>

    <VDivider />

    <VCardText>
      <template v-if="isFetching">
        <div class="d-flex align-center gap-2">
          <VProgressCircular indeterminate color="primary" />
          Carregando plano...
        </div>
      </template>
      <template v-else>
        <div v-if="!editMode" class="d-flex align-center flex-wrap gap-3 mb-4">
          <VChip color="primary" size="large">{{ new Intl.NumberFormat('pt-PT', { style: 'currency', currency: form.currency || 'AOA' }).format(Number(form.price || 0)) }}</VChip>
          <VChip color="secondary" size="small">{{ form.billingCycle === 'MONTHLY' ? 'Mensal' : 'Anual' }}</VChip>
          <VChip :color="plan?.isActive ? 'success' : 'error'" size="small">{{ plan?.isActive ? 'Ativo' : 'Inativo' }}</VChip>
        </div>
        <div class="d-flex flex-wrap gap-6">
          <!-- Nome -->
          <AppTextField v-model="form.name" label="Nome" :readonly="!editMode" style="min-inline-size: 280px;" />
          <!-- Descrição -->
          <AppTextField v-model="form.description" label="Descrição" :readonly="!editMode" style="min-inline-size: 280px;" />
          <!-- Preço -->
          <AppTextField v-model="form.price" type="number" label="Preço" :readonly="!editMode" style="min-inline-size: 200px;" />
          <!-- Moeda -->
          <AppTextField :model-value="form.currency || 'AOA'" label="Moeda" disabled style="min-inline-size: 200px;" />
          <!-- Ciclo -->
          <AppTextField :model-value="form.billingCycle === 'MONTHLY' ? 'Mensal' : 'Anual'" label="Ciclo" disabled style="min-inline-size: 200px;" />
          <!-- Ativo -->
          <VSwitch v-model="form.isActive" label="Ativo" :readonly="!editMode" />

          <VDivider class="my-4" />

          <AppTextField v-model="form.maxUsers" type="number" label="Máx. Usuários" :readonly="!editMode" style="min-inline-size: 200px;" />
          <AppTextField v-model="form.maxProcesses" type="number" label="Máx. Processos" :readonly="!editMode" style="min-inline-size: 200px;" />
          <AppTextField v-model="form.maxWorkflows" type="number" label="Máx. Workflows" :readonly="!editMode" style="min-inline-size: 200px;" />
          <AppTextField v-model="form.maxStorage" type="number" label="Máx. Armazenamento (GB)" :readonly="!editMode" style="min-inline-size: 220px;" />
          <AppTextField v-model="form.maxDocuments" type="number" label="Máx. Documentos" :readonly="!editMode" style="min-inline-size: 220px;" />
        </div>

        <VAlert v-if="errorMsg" type="error" class="mt-4">
          {{ errorMsg }}
        </VAlert>
      </template>
    </VCardText>
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
