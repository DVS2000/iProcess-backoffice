<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { $api } from '@/utils/api'

const router = useRouter()

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

const submitting = ref(false)
const errorMsg = ref('')

const submit = async () => {
  try {
    submitting.value = true
    errorMsg.value = ''

    const payload = {
      ...form.value,
      currency: 'AOA',
      billingCycle: 'MONTHLY',
      price: parseFloat(form.value.price || 0),
      maxUsers: form.value.maxUsers != null ? Number(form.value.maxUsers) : undefined,
      maxProcesses: form.value.maxProcesses != null ? Number(form.value.maxProcesses) : undefined,
      maxWorkflows: form.value.maxWorkflows != null ? Number(form.value.maxWorkflows) : undefined,
      maxStorage: form.value.maxStorage != null ? Number(form.value.maxStorage) : undefined,
      maxDocuments: form.value.maxDocuments != null ? Number(form.value.maxDocuments) : undefined,
    }

    await $api('/plans', { method: 'POST', body: payload })
    router.push({ name: 'plan-listar' })
  } catch (err) {
    console.error(err)
    errorMsg.value = err?.message || 'Falha ao criar plano'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <VCard>
    <VCardTitle>Adicionar Plano</VCardTitle>
    <VDivider />
    <VCardText>
      <VForm @submit.prevent="submit">
        <div class="d-flex flex-wrap gap-6">
          <AppTextField v-model="form.name" label="Nome" placeholder="Nome do plano" required style="min-inline-size: 280px;" />
          <AppTextField v-model="form.description" label="Descrição" placeholder="Descrição (opcional)" style="min-inline-size: 280px;" />
          <AppTextField v-model="form.price" type="number" label="Preço" placeholder="0" style="min-inline-size: 200px;" />
          <AppTextField :model-value="'AOA'" label="Moeda" disabled style="min-inline-size: 200px;" />
          <AppTextField :model-value="'Mensal'" label="Ciclo" disabled style="min-inline-size: 200px;" />
          <VSwitch v-model="form.isActive" label="Ativo" />

          <VDivider class="my-4" />

          <AppTextField v-model="form.maxUsers" type="number" label="Máx. Usuários" placeholder="Opcional" style="min-inline-size: 200px;" />
          <AppTextField v-model="form.maxProcesses" type="number" label="Máx. Processos" placeholder="Opcional" style="min-inline-size: 200px;" />
          <AppTextField v-model="form.maxWorkflows" type="number" label="Máx. Workflows" placeholder="Opcional" style="min-inline-size: 200px;" />
          <AppTextField v-model="form.maxStorage" type="number" label="Máx. Armazenamento (GB)" placeholder="Opcional" style="min-inline-size: 220px;" />
          <AppTextField v-model="form.maxDocuments" type="number" label="Máx. Documentos" placeholder="Opcional" style="min-inline-size: 220px;" />
        </div>

        <div class="d-flex justify-end gap-4 mt-6">
          <VBtn variant="tonal" color="secondary" :to="{ name: 'plan-listar' }">Cancelar</VBtn>
          <VBtn color="primary" type="submit" :loading="submitting">Salvar</VBtn>
        </div>

        <VAlert v-if="errorMsg" type="error" class="mt-4">
          {{ errorMsg }}
        </VAlert>
      </VForm>
    </VCardText>
  </VCard>
</template>
