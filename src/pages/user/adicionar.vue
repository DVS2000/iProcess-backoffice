<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { $api } from '@/utils/api'

const router = useRouter()

const form = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('USER')
const status = ref('ACTIVE')

const empresaId = ref('')
const departamentoId = ref('')

const companies = ref([])
const companiesLoading = ref(false)
const companiesSearch = ref('')

const departamentos = ref([])
const departamentosLoading = ref(false)

const roleOptions = ['ADMIN', 'USER']
const statusOptions = ['ACTIVE', 'INACTIVE']

const rules = {
  required: v => !!v || 'Obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  min6: v => (v?.length >= 6) || 'Mínimo 6 caracteres',
}

const loadCompanies = async () => {
  companiesLoading.value = true
  try {
    const qs = new URLSearchParams()
    qs.set('page', '1')
    qs.set('limit', '50')
    if (companiesSearch.value && companiesSearch.value.trim()) qs.set('search', companiesSearch.value.trim())
    const resp = await $api(`/empresas?${qs.toString()}`)
    const data = resp?.data ?? resp
    companies.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) {
    console.error(err)
  } finally {
    companiesLoading.value = false
  }
}

const loadDepartamentos = async () => {
  departamentosLoading.value = true
  try {
    if (!empresaId.value) { departamentos.value = []; return }
    const resp = await $api(`/departamentos/empresa/${empresaId.value}`)
    const data = resp?.data ?? resp
    departamentos.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) {
    console.error(err)
  } finally {
    departamentosLoading.value = false
  }
}

const saving = ref(false)
const errorMsg = ref('')

const save = async () => {
  const result = await form.value?.validate()
  if (!result?.valid) return

  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      status: status.value,
      empresa: empresaId.value ? { connect: { id: empresaId.value } } : undefined,
      departamento: departamentoId.value ? { connect: { id: departamentoId.value } } : undefined,
    }
    const resp = await $api('/user', { method: 'POST', body: payload })
    const created = resp?.data ?? resp
    router.push({ name: 'user-id', params: { id: created?.id } })
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao criar usuário'
    console.error(err)
  } finally {
    saving.value = false
  }
}

loadCompanies()
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" lg="7">
      <VCard>
        <VCardTitle>Adicionar usuário</VCardTitle>
        <VCardText>
          <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>

          <VForm ref="form" @submit.prevent="save">
            <VRow>
              <VCol cols="12" md="6">
                <VTextField v-model="name" label="Nome" :rules="[rules.required]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="email" label="Email" :rules="[rules.required, rules.email]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="password" label="Senha" type="password" :rules="[rules.required, rules.min6]" />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect v-model="role" :items="roleOptions" label="Role" :rules="[rules.required]" />
              </VCol>
              <VCol cols="12" md="3">
                <VSelect v-model="status" :items="statusOptions" label="Status" :rules="[rules.required]" />
              </VCol>

              <VCol cols="12" md="6">
                <VAutocomplete
                  v-model="empresaId"
                  :items="companies"
                  item-title="nomeSocial"
                  item-value="id"
                  label="Empresa"
                  :loading="companiesLoading"
                  :search="companiesSearch"
                  @update:search="companiesSearch = $event; loadCompanies()"
                  clearable
                  @update:modelValue="loadDepartamentos()"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VAutocomplete
                  v-model="departamentoId"
                  :items="departamentos"
                  item-title="nome"
                  item-value="id"
                  label="Departamento"
                  :loading="departamentosLoading"
                  clearable
                />
              </VCol>
            </VRow>

            <div class="d-flex gap-3 mt-6">
              <VBtn color="primary" type="submit" :loading="saving">
                <VIcon icon="tabler-device-floppy" class="me-2" />Guardar
              </VBtn>
              <VBtn variant="text" :to="{ name: 'user-listar' }">Cancelar</VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>