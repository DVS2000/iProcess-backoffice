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

const user = ref(null)
const isDeleted = ref(false)
const isEdit = ref(false)

// form fields
const form = ref(null)
const name = ref('')
const email = ref('')
const role = ref(null)
const status = ref('ACTIVE')
const newPassword = ref('')

const empresaId = ref('')
const departamentoId = ref('')
const companies = ref([])
const departamentos = ref([])
const roleModels = ref([])

const roleOptions = ['ADMIN', 'USER']

const statusOptions = [
  { id: 'ACTIVE', name: 'Ativo' },
  { id: 'INACTIVE', name: 'Inativo' },
  { id: 'SUSPENDED', name: 'Suspenso' },
  { id: 'PENDING', name: 'Pendente' },
]

const fetchUser = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const resp = await $api(`/user/${id.value}`)
    const data = resp?.data ?? resp

    user.value = data
    isDeleted.value = !!data?.is_deleted
    name.value = data?.name || ''
    email.value = data?.email || ''
    role.value = data?.roleModelId || 'USER'
    status.value = data?.status || 'ACTIVE'
    empresaId.value = data?.empresa?.id || data?.empresaId || ''
    departamentoId.value = data?.departamento?.id || data?.departamentoId || ''
    if (empresaId.value) await loadDepartamentos()
    await loadCompanies()
    await loadRoleModels()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao carregar usuário'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watchEffect(() => { if (id.value) fetchUser() })

const loadCompanies = async () => {
  try {
    const qs = new URLSearchParams()

    qs.set('page', '1')
    qs.set('limit', '50')

    const resp = await $api(`/empresas?${qs.toString()}`)
    const data = resp?.data ?? resp

    companies.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) { console.error(err) }
}

const loadDepartamentos = async () => {
  try {
    if (!empresaId.value) { departamentos.value = [] 

      return }
    const resp = await $api(`/departamentos/empresa/${empresaId.value}`)
    const data = resp?.data ?? resp

    departamentos.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) { console.error(err) }
}

const loadRoleModels = async () => {
  try {
    const resp = await $api('/role-model')
    const data = resp?.data ?? resp
    
    roleModels.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) {
    console.error(err)
  }
}

const save = async () => {
  const result = await form.value?.validate()
  if (!result?.valid) return
  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      name: name.value,
      email: email.value,
      roleModel: role.value ? { connect: { id: role.value } } : { disconnect: true },
      status: status.value,
      ...(newPassword.value ? { password: newPassword.value } : {}),
      empresa: empresaId.value ? { connect: { id: empresaId.value } } : { disconnect: true },
      departamento: departamentoId.value ? { connect: { id: departamentoId.value } } : { disconnect: true },
    }

    const resp = await $api(`/user/${id.value}`, { method: 'PUT', body: payload })
    const updated = resp?.data ?? resp

    user.value = updated
    isEdit.value = false
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao atualizar usuário'
    console.error(err)
  } finally {
    saving.value = false
  }
}

const restoring = ref(false)

const restore = async () => {
  try {
    restoring.value = true
    await $api(`/user/${id.value}/restore`, { method: 'PATCH' })
    await fetchUser()
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao restaurar usuário'
    console.error(err)
  } finally {
    restoring.value = false
  }
}

const deleteDialog = ref(false)
const deleting = ref(false)

const removeUser = async () => {
  try {
    deleting.value = true
    await $api(`/user/${id.value}`, { method: 'DELETE' })
    router.push({ name: 'user-listar' })
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao eliminar usuário'
    console.error(err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

const rules = {
  required: v => !!v || 'Obrigatório',
  email: v => /.[^\n\r@\u2028\u2029]*@.+\..+/.test(v) || 'Email inválido',
}
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" lg="7">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>{{ user?.name || 'Detalhes' }}</span>
          <div class="d-flex gap-2">
            <VBtn variant="text" color="info" @click="isEdit = !isEdit" :disabled="isDeleted">
              <VIcon icon="tabler-pencil" class="me-2" />
              {{ isEdit ? 'Cancelar edição' : 'Editar' }}
            </VBtn>
            <VBtn v-if="!isDeleted" variant="text" color="error" @click="deleteDialog = true">
              <VIcon icon="tabler-trash" class="me-2" />Eliminar
            </VBtn>
            <VBtn v-else color="success" variant="text" :loading="restoring" @click="restore">
              <VIcon icon="tabler-restore" class="me-2" />Restaurar
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
                    <VTextField v-model="name" label="Nome" :rules="[rules.required]" />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VTextField v-model="email" label="Email" :rules="[rules.required, rules.email]" />
                  </VCol>
                  <VCol cols="12" md="4">
                    <VSelect v-model="role" :items="roleModels" item-title="name" item-value="id" label="Perfil" :rules="[rules.required]" />
                  </VCol>
                  <VCol cols="12" md="4">
                    <VSelect v-model="status" :items="statusOptions" item-title="name" item-value="id" label="Status" :rules="[rules.required]" />
                  </VCol>
                  <VCol cols="12" md="4">
                    <VTextField v-model="newPassword" label="Nova senha" type="password" />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VAutocomplete
                      v-model="empresaId"
                      :items="companies"
                      item-title="nomeSocial"
                      item-value="id"
                      label="Empresa"
                      clearable
                      @update:modelValue="loadDepartamentos"
                    />
                  </VCol>
                  <VCol cols="12" md="6">
                    <VAutocomplete
                      v-model="departamentoId"
                      :items="departamentos"
                      item-title="nome"
                      item-value="id"
                      label="Departamento"
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
            </template>
            <template v-else>
              <VRow>
                <VCol cols="12" md="6">
                  <strong>Nome:</strong> {{ user?.name || '-' }}
                </VCol>
                <VCol cols="12" md="6">
                  <strong>Email:</strong> {{ user?.email || '-' }}
                </VCol>
                <VCol cols="12" md="6">
                  <strong>Role:</strong> {{ roleModels.find(r => r.id === user?.roleModelId)?.name || '-' }}
                </VCol>
                <VCol cols="12" md="6">
                  <strong>Status:</strong> {{ statusOptions.find(s => s.id === user?.status)?.name || '-' }}
                </VCol>
                <VCol cols="12" md="6">
                  <strong>Empresa:</strong> {{ user?.empresa?.nomeSocial || '-' }}
                </VCol>
                <VCol cols="12" md="6">
                  <strong>Departamento:</strong> {{ user?.departamento?.nome || '-' }}
                </VCol>
              </VRow>
            </template>
          </template>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog v-model="deleteDialog" max-width="420">
    <VCard>
      <VCardTitle>Eliminar usuário</VCardTitle>
      <VCardText>Tem certeza que deseja eliminar este usuário?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" :loading="deleting" @click="removeUser">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
