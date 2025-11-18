<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'

const { get, patch, del } = useApi()
const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)
const isEdit = computed(() => route.query.edit === 'true')

const form = ref(null)
const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')

const documento = ref({})

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await get(`/documento-empresa/${id.value}`)

    documento.value = res?.data ?? res
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao carregar documento'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watchEffect(() => { if (id.value) load() })

const rules = { required: v => !!v || 'Obrigatório' }

const save = async () => {
  const r = await form.value?.validate?.()
  if (!r?.valid) return
  saving.value = true
  errorMsg.value = ''
  try {
    const updated = await patch(`/documento-empresa/${id.value}`, documento.value)

    documento.value = updated?.data ?? updated
    router.replace({ name: 'documento-empresa-id', params: { id: id.value } })
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao atualizar documento'
    console.error(err)
  } finally { saving.value = false }
}

const removeItem = async () => {
  try {
    await del(`/documento-empresa/${id.value}`)
    router.push({ name: 'documento-empresa-listar' })
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao eliminar documento'
    console.error(err)
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Documento da Empresa</span>
      <div class="d-flex gap-2">
        <VBtn color="error" variant="tonal" @click="removeItem"><VIcon icon="tabler-trash" class="me-2" />Eliminar</VBtn>
        <VBtn v-if="!isEdit" color="primary" variant="tonal" @click="router.replace({ query: { edit: 'true' } })"><VIcon icon="tabler-pencil" class="me-2" />Editar</VBtn>
      </div>
    </VCardTitle>
    <VCardText>
      <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>
      <VForm ref="form" v-if="isEdit" @submit.prevent="save">
        <VRow>
          <VCol cols="12" md="6">
            <VTextField v-model="documento.tipoDocumento" label="Tipo de Documento" :rules="[rules.required]" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="documento.numeroRef" label="Número de Referência" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="documento.ficheiro" label="Ficheiro (URL ou caminho)" :rules="[rules.required]" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="documento.validade" type="date" label="Validade" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="documento.dataEmissao" type="date" label="Data de Emissão" />
          </VCol>
        </VRow>
        <div class="d-flex gap-3 mt-6">
          <VBtn type="submit" color="primary" :loading="saving">
            <VIcon icon="tabler-device-floppy" class="me-2" />
            Guardar
          </VBtn>
          <VBtn variant="text" @click="router.replace({ query: {} })">Cancelar</VBtn>
        </div>
      </VForm>

      <div v-else>
        <VRow>
          <VCol cols="12" md="6"><strong>Empresa:</strong> {{ documento?.empresa?.nomeSocial || '-' }}</VCol>
          <VCol cols="12" md="6"><strong>Tipo:</strong> {{ documento?.tipoDocumento || '-' }}</VCol>
          <VCol cols="12" md="6"><strong>Número Ref.:</strong> {{ documento?.numeroRef || '-' }}</VCol>
          <VCol cols="12" md="6"><strong>Validade:</strong> {{ documento?.validade ? new Date(documento.validade).toLocaleDateString() : '-' }}</VCol>
          <VCol cols="12" md="6"><strong>Emissão:</strong> {{ documento?.dataEmissao ? new Date(documento.dataEmissao).toLocaleDateString() : '-' }}</VCol>
          <VCol cols="12" md="6"><strong>Ficheiro:</strong> <a :href="documento?.ficheiro" target="_blank">Abrir</a></VCol>
        </VRow>
      </div>
    </VCardText>
  </VCard>
</template>