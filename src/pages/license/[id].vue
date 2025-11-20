<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)
const isEdit = computed(() => route.query.edit === '1')

const { data, isFetching, error, execute: reload } = await useApi(`/licenses/${id.value}`)
const lic = computed(() => data.value?.data || data.value)
const usage = ref(null)

const saving = ref(false)
const saveError = ref('')
const form = ref({})

const startEdit = () => { form.value = { ...lic.value }; router.replace({ name: 'license-id', params: { id: id.value }, query: { edit: '1' } }) }
const cancelEdit = () => { router.replace({ name: 'license-id', params: { id: id.value } }) }

const save = async () => {
  saving.value = true
  saveError.value = ''
  try {
    await $api(`/licenses/${id.value}`, { method: 'PUT', body: form.value })
    await reload()
    cancelEdit()
  } catch (err) {
    saveError.value = err?.data?.message || 'Falha ao guardar'
  } finally {
    saving.value = false
  }
}

const toggleStatus = async () => {
  const next = lic.value?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

  await $api(`/licenses/${id.value}`, { method: 'PUT', body: { status: next } })
  await reload()
  await loadUsage()
}

const formatDate = d => (d ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(d)) : '-')
const statusPt = s => ({ ACTIVE: 'ATIVA', EXPIRED: 'EXPIRADA', SUSPENDED: 'SUSPENSA', CANCELLED: 'CANCELADA' }[s] || s)

const toGB = mb => (mb != null ? Number(mb) / 1024 : null)

const formatGB = mb => {
  const v = toGB(mb)

  return v != null ? v.toFixed(2) : '-'
}

const loadUsage = async () => {
  if (!lic.value?.empresaId) return
  const resp = await $api(`/licenses/empresa/${lic.value.empresaId}/usage`)

  usage.value = resp?.data || resp
}

await loadUsage()
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-3">
        <span>Licença</span>
        <VChip
          :color="lic?.status === 'ACTIVE' ? 'success' : lic?.status === 'SUSPENDED' ? 'warning' : lic?.status === 'CANCELLED' ? 'error' : 'secondary'"
          class="text-uppercase" size="small"
          >
          {{ statusPt(lic?.status) }}
        </VChip>
      </div>
    </VCardTitle>
    <VCardText>
      <VProgressLinear v-if="isFetching" indeterminate class="mb-4" />
      <VAlert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ (error && error.message) || 'Falha ao carregar' }}
      </VAlert>

      <template v-if="!isEdit">
        <VRow>
          <VCol cols="12" md="6">
            <VCard variant="tonal">
              <VCardTitle>Empresa</VCardTitle>
              <VCardText>
                <div>Nome: {{ lic?.empresa?.nomeSocial }}</div>
                <div>NIF: {{ lic?.empresa?.nif }}</div>
                <div>Email: {{ lic?.empresa?.email }}</div>
                <div>Telefone: {{ lic?.empresa?.telefone }}</div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard variant="tonal">
              <VCardTitle>Datas</VCardTitle>
              <VCardText>
                <div>Início: {{ formatDate(lic?.startDate) }}</div>
                <div>Expira: {{ formatDate(lic?.endDate) }}</div>
                <div>Pagamento: {{ formatDate(lic?.paymentDate) }}</div>
                <br>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard variant="tonal">
              <VCardTitle>Plano</VCardTitle>
              <VCardText>
                <div>Nome: {{ lic?.plan?.name }}</div>
                <div>Descrição: {{ lic?.plan?.description }}</div>
                <div>Preço: {{ lic?.plan?.price }} {{ lic?.plan?.currency }}</div>
                <!-- <div>Ciclo: {{ lic?.plan?.billingCycle }}</div> -->
                <div>Ciclo: Mensal</div>
                <div>Máx. Documentos: {{ lic?.plan?.maxDocuments }}</div>
                <div>Máx. Processos: {{ lic?.plan?.maxProcesses }}</div>
                <div>Máx. Workflows: {{ lic?.plan?.maxWorkflows }}</div>
                <div>Máx. Utilizadores: {{ lic?.plan?.maxUsers }}</div>
                <div>Máx. Armazenamento: {{ formatGB(lic?.plan?.maxStorage) }} GB</div>
              </VCardText>
            </VCard>
          </VCol>
          
          <VCol cols="12" md="6">
            <VCard variant="tonal">
              <VCardTitle>Consumo atual</VCardTitle>
              <VCardText class="mb-5 mt-3">
                <!--
              <div>Utilizadores: {{ lic?.currentUsers }}</div>
              <div>Processos: {{ lic?.currentProcesses }}</div>
              <div>Workflows: {{ lic?.currentWorkflows }}</div>
              <div>Documentos: {{ lic?.currentDocuments }}</div>
              <div>Armazenamento: {{ lic?.currentStorage }} MB</div> 
            -->
                <template v-if="usage && usage.usage">
                  <div class="text-caption">
                    Users: {{ usage.usage.users.current }} / {{ usage.usage.users.max }}
                  </div>
                  <VProgressLinear
                    :model-value="Math.round((usage.usage.users.current / usage.usage.users.max) * 100)"
                    color="primary" class="mb-2"
                  />

                  <div class="text-caption">
                    Processos: {{ usage.usage.processes.current }} / {{ usage.usage.processes.max }}
                  </div>
                  <VProgressLinear
                    :model-value="Math.round((usage.usage.processes.current / usage.usage.processes.max) * 100)"
                    color="info" class="mb-2"
                  />


                  <div class="text-caption">
                    Workflows: {{ usage.usage.workflows.current }} / {{ usage.usage.workflows.max }}
                  </div>
                  <VProgressLinear
                    :model-value="Math.round((usage.usage.workflows.current / usage.usage.workflows.max) * 100)"
                    color="success" class="mb-2"
                  />


                  <div class="text-caption">
                    Documentos: {{ usage.usage.documents.current }} / {{ usage.usage.documents.max }}
                  </div>
                  <VProgressLinear
                    :model-value="Math.round((usage.usage.documents.current / usage.usage.documents.max) * 100)"
                    color="error" class="mb-2"
                  />

                  <div class="text-caption">
                    Armazenamento: {{ formatGB(usage.usage.storage.current) }} GB / {{ formatGB(usage.usage.storage.max) }} GB
                  </div>
                  <VProgressLinear
                    :model-value="Math.round((usage.usage.storage.current / usage.usage.storage.max) * 100)"
                    color="warning" class="mb-2"
                  />
                </template>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </template>

      <template v-else>
        <VAlert v-if="saveError" type="error" variant="tonal" class="mb-4">
          {{ saveError }}
        </VAlert>
        <VForm @submit.prevent="save">
          <VRow>
            <VCol cols="12" md="6">
              <VCard variant="tonal">
                <VCardTitle>Empresa</VCardTitle>
                <VCardText>
                  <div>Nome: {{ lic?.empresa?.nomeSocial }}</div>
                  <div>NIF: {{ lic?.empresa?.nif }}</div>
                  <div>Email: {{ lic?.empresa?.email }}</div>
                  <div>Telefone: {{ lic?.empresa?.telefone }}</div>
                </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.startDate" label="Início" type="datetime-local" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.endDate" label="Expira em" type="datetime-local" />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="form.status" :items="['ACTIVE', 'INACTIVE']" label="Status" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.paymentReference" label="Referência de Pagamento" />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField v-model="form.paymentDate" label="Data de Pagamento" type="datetime-local" />
            </VCol>
          </VRow>
          <VCardActions>
            <VSpacer />
            <VBtn variant="text" @click="cancelEdit">
              Cancelar
            </VBtn>
            <VBtn color="primary" type="submit" :loading="saving">
              Guardar
            </VBtn>
          </VCardActions>
        </VForm>
      </template>
    </VCardText>
  </VCard>
</template>
