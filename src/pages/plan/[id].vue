<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const editMode = ref(route.query.edit === 'true')

const { data, execute: fetchPlan, isFetching, error } = await useApi(`/plans/${id}`)
const plan = ref(null)

watch(data, () => {
  plan.value = data.value?.data || null
  if (plan.value) {
    form.value = {
      name: plan.value.name || '',
      description: plan.value.description || '',
      price: plan.value.price ?? 0,
      currency: plan.value.currency || 'BRL',
      billingCycle: plan.value.billingCycle || 'MONTHLY',
      isActive: !!plan.value.isActive,
      maxUsers: plan.value.maxUsers ?? null,
      maxProcesses: plan.value.maxProcesses ?? null,
      maxWorkflows: plan.value.maxWorkflows ?? null,
      maxStorage: plan.value.maxStorage ?? null,
      maxDocuments: plan.value.maxDocuments ?? null,
    }
  }
}, { immediate: true })

const form = ref({
  name: '',
  description: '',
  price: 0,
  currency: 'BRL',
  billingCycle: 'MONTHLY',
  isActive: true,
  maxUsers: null,
  maxProcesses: null,
  maxWorkflows: null,
  maxStorage: null,
  maxDocuments: null,
})

const { patch, del } = useApi('/plans')
const saving = ref(false)
const errorMsg = ref('')

const save = async () => {
  try {
    saving.value = true
    errorMsg.value = ''
    const payload = {
      ...form.value,
      price: Number(form.value.price || 0),
      maxUsers: form.value.maxUsers != null ? Number(form.value.maxUsers) : undefined,
      maxProcesses: form.value.maxProcesses != null ? Number(form.value.maxProcesses) : undefined,
      maxWorkflows: form.value.maxWorkflows != null ? Number(form.value.maxWorkflows) : undefined,
      maxStorage: form.value.maxStorage != null ? Number(form.value.maxStorage) : undefined,
      maxDocuments: form.value.maxDocuments != null ? Number(form.value.maxDocuments) : undefined,
    }
    await patch(`/plans/${id}`, { body: payload })
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
    await patch(`/plans/${id}/activate`)
    await fetchPlan()
  } catch (err) {
    console.error(err)
  }
}

const desativar = async () => {
  try {
    await patch(`/plans/${id}/deactivate`)
    await fetchPlan()
  } catch (err) {
    console.error(err)
  }
}

const deleteDialog = ref(false)
const askDelete = () => { deleteDialog.value = true }
const deletePlan = async () => {
  try {
    await del(`/plans/${id}`)
    router.push({ name: 'plan-listar' })
  } catch (err) {
    console.error(err)
  } finally {
    deleteDialog.value = false
  }
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
        <VBtn v-if="plan?.isActive" color="warning" variant="tonal" @click="desativar">
          <VIcon icon="tabler-pause" start />
          Desativar
        </VBtn>
        <VBtn v-else color="success" variant="tonal" @click="ativar">
          <VIcon icon="tabler-play" start />
          Ativar
        </VBtn>
        <VBtn color="error" variant="tonal" @click="askDelete">
          <VIcon icon="tabler-trash" start />
          Excluir
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
        <div class="d-flex flex-wrap gap-6">
          <!-- Nome -->
          <AppTextField v-model="form.name" label="Nome" :readonly="!editMode" style="min-inline-size: 280px;" />
          <!-- Descrição -->
          <AppTextField v-model="form.description" label="Descrição" :readonly="!editMode" style="min-inline-size: 280px;" />
          <!-- Preço -->
          <AppTextField v-model="form.price" type="number" label="Preço" :readonly="!editMode" style="min-inline-size: 200px;" />
          <!-- Moeda -->
          <VSelect v-model="form.currency" :items="['BRL', 'USD', 'EUR']" label="Moeda" :readonly="!editMode" style="min-inline-size: 200px;" />
          <!-- Ciclo -->
          <VSelect v-model="form.billingCycle" :items="[{ title: 'Mensal', value: 'MONTHLY' }, { title: 'Anual', value: 'YEARLY' }]" label="Ciclo" :readonly="!editMode" style="min-inline-size: 200px;" />
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

  <!-- Delete confirm dialog -->
  <VDialog v-model="deleteDialog" max-width="500">
    <VCard>
      <VCardTitle>Confirmar exclusão</VCardTitle>
      <VCardText>Tem certeza que deseja excluir este plano?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" @click="deletePlan">Excluir</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>