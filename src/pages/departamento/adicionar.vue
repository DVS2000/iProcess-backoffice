<script setup>
import { ref } from 'vue'
import { $api } from '@/utils/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref(null)
const loading = ref(false)
const errorMsg = ref('')

// Campos conforme CreateDepartamentoDto
const empresaSearch = ref('')
const empresas = ref([])
const empresaId = ref('')

const nome = ref('')
const descricao = ref('')
const chefeSearch = ref('')
const chefes = ref([])
const chefeId = ref('')
const contacto = ref('')

const rules = { required: v => !!v || 'Obrigatório' }

const loadEmpresas = async () => {
  try {
    const qs = new URLSearchParams()

    qs.set('page', '1')
    qs.set('limit', '10')
    if (empresaSearch.value && empresaSearch.value.trim()) qs.set('search', empresaSearch.value.trim())
    const resp = await $api(`/empresas?${qs.toString()}`)
    const data = resp?.data ?? resp

    empresas.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) { console.error(err) }
}

const loadChefeCandidates = async () => {
  chefes.value = []
  if (!empresaId.value) return
  try {
    // Lista usuários por empresa para escolher chefe
    const qs = new URLSearchParams()

    qs.set('page', '1')
    qs.set('limit', '10')
    if (chefeSearch.value && chefeSearch.value.trim()) qs.set('search', chefeSearch.value.trim())
    const resp = await $api(`/user/empresa/${empresaId.value}?${qs.toString()}`)
    const data = resp?.data ?? resp

    chefes.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) { console.error(err) }
}

const submit = async () => {
  errorMsg.value = ''

  const { valid } = await form.value?.validate()
  if (!valid) return
  loading.value = true
  try {
    const payload = {
      empresaId: empresaId.value,
      nome: nome.value,
      descricao: descricao.value || undefined,
      chefeId: chefeId.value || undefined,
      contacto: contacto.value || undefined,
    }

    const dep = await $api('/departamentos', { method: 'POST', body: payload })
    if (dep?.id) {
      router.push({ name: 'departamento-id', params: { id: dep.id } })
    } else {
      router.push({ name: 'departamento-listar' })
    }
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao criar departamento'
    console.error(err)
  } finally {
    loading.value = false
  }
}

loadEmpresas()
</script>

<template>
  <VCard>
    <VCardTitle>Adicionar Departamento</VCardTitle>
    <VCardText>
      <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>
      <VForm ref="form" @submit.prevent="submit">
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
              @update:model-value="loadChefeCandidates"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="nome" label="Nome do Departamento" :rules="[rules.required]" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="descricao" label="Descrição" />
          </VCol>
          <VCol cols="12" md="6">
            <VAutocomplete
              v-model="chefeId"
              :items="chefes"
              item-title="name"
              item-value="id"
              label="Chefe do Departamento"
              :search="chefeSearch"
              @update:search="chefeSearch = $event; loadChefeCandidates()"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="contacto" label="Contacto" />
          </VCol>
        </VRow>
        <div class="d-flex gap-3 mt-6">
          <VBtn color="primary" type="submit" :loading="loading">
            <VIcon icon="tabler-device-floppy" class="me-2" />
            Guardar
          </VBtn>
          <VBtn variant="text" :to="{ name: 'departamento-listar' }">Cancelar</VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>