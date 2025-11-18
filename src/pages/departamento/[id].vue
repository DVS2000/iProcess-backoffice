<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { $api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)

const loading = ref(false)
const errorMsg = ref('')
const saving = ref(false)

const departamento = ref(null)
const isEdit = ref(false)

// Form fields
const form = ref(null)
const empresaId = ref('')
const nome = ref('')
const descricao = ref('')
const chefeId = ref('')
const contacto = ref('')

// Aux lists
const empresas = ref([])
const empresasLoading = ref(false)
const empresasSearch = ref('')

const chefes = ref([])
const chefesLoading = ref(false)
const chefeSearch = ref('')

const rules = {
  required: v => !!v || 'Obrigatório',
}

const formatDateTime = d => (d ? new Date(d).toLocaleString() : '-')

const fetchDepartamento = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const resp = await $api(`/departamentos/${id.value}`)
    const data = resp?.data ?? resp

    departamento.value = data
    empresaId.value = data?.empresa?.id || data?.empresaId || ''
    nome.value = data?.nome || ''
    descricao.value = data?.descricao || ''
    chefeId.value = data?.chefe?.id || data?.chefeId || ''
    contacto.value = data?.contacto || ''

    await loadEmpresas()
    await loadChefeCandidates()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao carregar departamento'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watchEffect(() => { if (id.value) fetchDepartamento() })

const loadEmpresas = async () => {
  empresasLoading.value = true
  try {
    const qs = new URLSearchParams()

    qs.set('page', '1')
    qs.set('limit', '50')
    if (empresasSearch.value && empresasSearch.value.trim()) qs.set('search', empresasSearch.value.trim())
    const resp = await $api(`/empresas?${qs.toString()}`)
    const data = resp?.data ?? resp

    empresas.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) {
    console.error(err)
  } finally {
    empresasLoading.value = false
  }
}

const loadChefeCandidates = async () => {
  chefesLoading.value = true
  try {
    chefes.value = []
    if (!empresaId.value) { chefesLoading.value = false 

      return }
    const qs = new URLSearchParams()

    qs.set('page', '1')
    qs.set('limit', '50')
    if (chefeSearch.value && chefeSearch.value.trim()) qs.set('search', chefeSearch.value.trim())
    const resp = await $api(`/user/empresa/${empresaId.value}?${qs.toString()}`)
    const data = resp?.data ?? resp


    // Backend retorna { data, pagination }
    chefes.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) {
    console.error(err)
  } finally {
    chefesLoading.value = false
  }
}

const save = async () => {
  const result = await form.value?.validate()
  if (!result?.valid) return
  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      empresaId: empresaId.value,
      nome: nome.value,
      descricao: descricao.value || undefined,
      chefeId: chefeId.value || undefined,
      contacto: contacto.value || undefined,
    }

    const resp = await $api(`/departamentos/${id.value}`, { method: 'PATCH', body: payload })
    const updated = resp?.data ?? resp

    departamento.value = updated
    isEdit.value = false
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao atualizar departamento'
    console.error(err)
  } finally {
    saving.value = false
  }
}

const deleteDialog = ref(false)
const deleting = ref(false)

const removeDepartamento = async () => {
  try {
    deleting.value = true
    await $api(`/departamentos/${id.value}`, { method: 'DELETE' })
    router.push({ name: 'departamento-listar' })
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao eliminar departamento'
    console.error(err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <span>Departamento: {{ departamento?.nome || 'Detalhes' }}</span>
      <div class="d-flex gap-2">
        <VBtn variant="text" color="info" @click="isEdit = !isEdit">
          <VIcon icon="tabler-pencil" class="me-2" />
          {{ isEdit ? 'Cancelar edição' : 'Editar' }}
        </VBtn>
        <VBtn variant="text" color="error" @click="deleteDialog = true">
          <VIcon icon="tabler-trash" class="me-2" />Eliminar
        </VBtn>
      </div>
    </VCardTitle>
    <VCardText>
      <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>

      <template v-if="loading">
        <div class="py-6 d-flex justify-center"><VProgressCircular indeterminate color="primary" /></div>
      </template><template v-else>
        <template v-if="isEdit">
          <VForm ref="form" @submit.prevent="save">
            <VRow>
              <VCol cols="12" md="6">
                <VAutocomplete
                  v-model="empresaId"
                  :items="empresas"
                  item-title="nomeSocial"
                  item-value="id"
                  label="Empresa"
                  :loading="empresasLoading"
                  :search="empresasSearch"
                  @update:search="empresasSearch = $event; loadEmpresas()"
                  clearable
                  @update:modelValue="loadChefeCandidates"
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
                  :loading="chefesLoading"
                  :search="chefeSearch"
                  @update:search="chefeSearch = $event; loadChefeCandidates()"
                  clearable
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="contacto" label="Contacto" />
              </VCol>
            </VRow>
            <div class="d-flex gap-3 mt-6">
              <VBtn color="primary" type="submit" :loading="saving">
                <VIcon icon="tabler-device-floppy" class="me-2" />Guardar
              </VBtn>
              <VBtn variant="text" :to="{ name: 'departamento-listar' }">Cancelar</VBtn>
            </div>
          </VForm>
        </template>
        <template v-else>
          <VRow>
            <VCol cols="12" md="6"><strong>Empresa:</strong> {{ departamento?.empresa?.nomeSocial || '-' }}</VCol>
            <VCol cols="12" md="6"><strong>Nome:</strong> {{ departamento?.nome || '-' }}</VCol>
            <VCol cols="12" md="6"><strong>Descrição:</strong> {{ departamento?.descricao || '-' }}</VCol>
            <VCol cols="12" md="6"><strong>Chefe:</strong> {{ departamento?.chefe?.name || '-' }}</VCol>
            <VCol cols="12" md="6"><strong>Contacto:</strong> {{ departamento?.contacto || '-' }}</VCol>
            <VCol cols="12" md="6"><strong>Criado em:</strong> {{ formatDateTime(departamento?.createdAt) }}</VCol>
          </VRow>
        </template>
      </template>
    </VCardText>
  </VCard>

  <VDialog v-model="deleteDialog" max-width="420">
    <VCard>
      <VCardTitle>Eliminar departamento</VCardTitle>
      <VCardText>Tem certeza que deseja eliminar este departamento?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" :loading="deleting" @click="removeDepartamento">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>