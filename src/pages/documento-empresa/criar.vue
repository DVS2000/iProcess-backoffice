<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { createUrl } from '@core/composable/createUrl'

const router = useRouter()
const { get, post } = useApi()

const form = ref(null)
const saving = ref(false)
const errorMsg = ref('')

const empresaSearch = ref('')
const empresas = ref([])
const empresaId = ref('')
const tipoDocumento = ref('')
const numeroRef = ref('')
const ficheiro = ref('')
const validade = ref('')
const dataEmissao = ref('')

const loadEmpresas = async () => {
  try {
    const url = createUrl('/empresas', { query: { page: 1, limit: 10, search: empresaSearch.value || undefined } })
    const res = await get(url)

    empresas.value = res?.data?.data || []
  } catch (err) { console.error(err) }
}

const rules = { required: v => !!v || 'Obrigatório' }

const save = async () => {
  const res = await form.value?.validate()
  if (!res?.valid) return
  saving.value = true
  errorMsg.value = ''
  try {
    await post('/documento-empresa', {
      empresaId: empresaId.value,
      tipoDocumento: tipoDocumento.value,
      numeroRef: numeroRef.value || undefined,
      ficheiro: ficheiro.value,
      validade: validade.value || undefined,
      dataEmissao: dataEmissao.value || undefined,
    })
    router.push({ name: 'documento-empresa-listar' })
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao criar documento'
    console.error(err)
  } finally { saving.value = false }
}

loadEmpresas()
</script>

<template>
  <VCard>
    <VCardTitle>Adicionar Documento da Empresa</VCardTitle>
    <VCardText>
      <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>
      <VForm ref="form" @submit.prevent="save">
        <VRow>
          <VCol cols="12" md="6">
            <VAutocomplete
              v-model="empresaId"
              :items="empresas"
              item-title="nomeSocial"
              item-value="id"
              label="Empresa"
              :rules="[rules.required]"
              :search="empresaSearch"
              @update:search="empresaSearch = $event; loadEmpresas()"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="tipoDocumento" label="Tipo de Documento" :rules="[rules.required]" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="numeroRef" label="Número de Referência" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="ficheiro" label="Ficheiro (URL ou caminho)" :rules="[rules.required]" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="validade" type="date" label="Validade" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="dataEmissao" type="date" label="Data de Emissão" />
          </VCol>
        </VRow>
        <div class="d-flex gap-3 mt-6">
          <VBtn type="submit" color="primary" :loading="saving">
            <VIcon icon="tabler-device-floppy" class="me-2" />
            Guardar
          </VBtn>
          <VBtn variant="text" @click="router.push({ name: 'documento-empresa-listar' })">Cancelar</VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>