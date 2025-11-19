<script setup>
import { ref, watch } from 'vue'
import { $api } from '@/utils/api'
import { useRouter } from 'vue-router'
import { $fetch } from 'ofetch'

const router = useRouter()

const form = ref(null)
const loading = ref(false)
const errorMsg = ref('')

// Campos conforme CreateEmpresaDto
const nomeSocial = ref('')
const nomeFantasia = ref('')
const nif = ref('')
const nameFieldsDisabled = ref(true)
const nifLookupLoading = ref(false)
const tipoSocietario = ref('')
const capitalSocial = ref('')
const actividade = ref('')
const dataConstituicao = ref('')
const sedeEndereco = ref('')
const telefone = ref('')
const email = ref('')
const estadoLegal = ref('Ativa')

// Normalizador de decimal para backend (remove pontos de milhar, troca vírgula por ponto)
const toDecimalString = v => {
  if (v === null || v === undefined) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  const normalized = s.replace(/\./g, '').replace(',', '.')
  
  return normalized
}

const rules = {
  required: v => !!v || 'Obrigatório',
  nif10: v => (/^\d{10}$/.test(String(v)) || 'NIF deve ter 10 dígitos numéricos'),
}

watch(nif, async val => {
  const digits = String(val || '').replace(/\D/g, '').slice(0, 10)
  if (digits !== val) nif.value = digits
  if (digits.length === 10) {
    nifLookupLoading.value = true
    try {
      const resp = await $fetch(`https://consulta.edgarsingui.ao/consultar/${digits}/nif`)
      if (resp && resp.error === false && resp.name) {
        nomeSocial.value = resp.name
        nomeFantasia.value = resp.name
        nameFieldsDisabled.value = true
      } else {
        nameFieldsDisabled.value = false
      }
    } catch (e) {
      nameFieldsDisabled.value = false
    } finally {
      nifLookupLoading.value = false
    }
  } else {
    nameFieldsDisabled.value = true
  }
})

definePage({ meta: { action: 'create', subject: 'empresa' } })

const submit = async () => {
  errorMsg.value = ''

  const { valid } = await form.value?.validate()
  if (!valid) return
  loading.value = true
  try {
    const payload = {
      nomeSocial: nomeSocial.value,
      nomeFantasia: nomeFantasia.value || undefined,
      nif: nif.value,
      tipoSocietario: tipoSocietario.value || undefined,
      capitalSocial: toDecimalString(capitalSocial.value),
      actividade: actividade.value || undefined,
      dataConstituicao: dataConstituicao.value || undefined,
      sedeEndereco: sedeEndereco.value || undefined,
      telefone: telefone.value || undefined,
      email: email.value || undefined,
      estadoLegal: estadoLegal.value || undefined,
    }

    const empresa = await $api('/empresas', { method: 'POST', body: payload })
    if (empresa?.id) {
      router.push({ name: 'empresa-id', params: { id: empresa.id } })
    }
    else {
      router.push({ name: 'empresa-listar' })
    }
  }
  catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao criar empresa'
    console.error(err)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>Adicionar Empresa</VCardTitle>
        <VCardText>
          <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>
          <VForm ref="form" @submit.prevent="submit">
            <VRow>
              <VCol cols="12" md="6">
                <VTextField v-model="nomeSocial" label="Nome Social" :rules="[rules.required]" :disabled="nameFieldsDisabled" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="nomeFantasia" label="Nome Fantasia" :disabled="nameFieldsDisabled" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="nif" label="NIF" :rules="[rules.required, rules.nif10]" inputmode="numeric" maxlength="10" :counter="10" :loading="nifLookupLoading" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="tipoSocietario" label="Tipo Societário" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="capitalSocial" label="Capital Social" type="text" inputmode="decimal" placeholder="Ex.: 1.234,56" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="actividade" label="Actividade" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="dataConstituicao" label="Data de Constituição" type="date" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="sedeEndereco" label="Sede / Endereço" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="telefone" label="Telefone" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="email" label="Email" type="email" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="estadoLegal" label="Estado Legal" />
              </VCol>
            </VRow>

            <div class="d-flex gap-3 mt-6">
              <VBtn color="primary" type="submit" :loading="loading">
                <VIcon icon="tabler-device-floppy" class="me-2" />
                Guardar
              </VBtn>
              <VBtn variant="text" :to="{ name: 'empresa-listar' }">Cancelar</VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>