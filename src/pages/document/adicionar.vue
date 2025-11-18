<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'
import { createUrl } from '@/@core/composable/createUrl'

const router = useRouter()
const route = useRoute()

// Fetch current user profile to get id
const { data: profileData } = await useApi('/auth/profile')

const userDataCookie = useCookie('userData')
const currentUserId = computed(() => profileData.value?.id || userDataCookie.value?.id)

// Folder options
const { data: foldersData, isFetching: isFetchingFolders } = await useApi(createUrl('/folder', {
  query: { page: 1, limit: 50 },
}))

const folderOptions = computed(() => (foldersData.value?.data?.data || []).map(f => ({ label: f.name || f.nome || f.title || f.id, value: f.id })))

// Policy options (optional)
const { data: policiesData, isFetching: isFetchingPolicies } = await useApi(createUrl('/compliance-policy', {
  query: { page: 1, limit: 50 },
}))

const policyOptions = computed(() => (policiesData.value?.data?.data || []).map(p => ({ label: p.name || p.title || p.id, value: p.id })))

// Form fields
const title = ref('')
const folderId = ref(null)
const policyId = ref(null)
const file = ref(null)
const metadata = ref({})

const uploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const submitDisabled = computed(() => !file.value || !currentUserId.value || uploading.value)

// Upload endpoint requires multipart/form-data com: file, title, idUser, metadata(json string), folderId?, policyId?

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    // VFileInput pode retornar File ou Array<File>
    const selectedFile = Array.isArray(file.value) ? file.value[0] : file.value
    if (!selectedFile || !(selectedFile instanceof File)) {
      errorMessage.value = 'Selecione um arquivo válido para enviar.'

      return
    }
    if (!currentUserId.value) {
      errorMessage.value = 'Usuário não autenticado.'
      
      return
    }
    uploading.value = true

    const fd = new FormData()

    fd.append('file', selectedFile)
    if (title.value) fd.append('title', title.value)
    fd.append('idUser', String(currentUserId.value))
    if (folderId.value) fd.append('folderId', folderId.value)
    if (policyId.value) fd.append('policyId', policyId.value)
    if (metadata.value && Object.keys(metadata.value).length) {
      fd.append('metadata', JSON.stringify(metadata.value))
    }

    const resp = await $api('/document/upload', { method: 'POST', body: fd })

    const id = resp?.id || resp?.data?.id
    if (id) {
      successMessage.value = 'Documento enviado com sucesso.'
      router.push({ name: 'document-id', params: { id } })
    } else {
      errorMessage.value = 'Falha ao enviar documento.'
    }
  } catch (err) {
    console.error(err)
    errorMessage.value = (err && err.message) || 'Falha ao enviar documento.'
  } finally {
    uploading.value = false
  }
}

const goBack = () => router.push({ name: 'document-listar' })

// Prefill folder from route query if provided
if (route?.query?.folderId)
  folderId.value = route.query.folderId
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" lg="7">
      <VCard>
        <VCardTitle>Adicionar Documento</VCardTitle>
        <VCardText>
          <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4">{{ errorMessage }}</VAlert>
          <VAlert v-if="successMessage" type="success" variant="tonal" class="mb-4">{{ successMessage }}</VAlert>

          <VProgressLinear v-if="uploading" indeterminate color="primary" class="mb-4" />

          <VForm @submit.prevent="handleSubmit">
            <VTextField v-model="title" label="Título (opcional)" placeholder="Título do documento" class="mb-4" />

            <VAutocomplete
v-model="folderId" :items="folderOptions" :loading="isFetchingFolders"
              label="Pasta (opcional)" item-title="label" item-value="value" clearable class="mb-4" />

            <VAutocomplete
v-model="policyId" :items="policyOptions" :loading="isFetchingPolicies"
              label="Política de Compliance (opcional)" item-title="label" item-value="value" clearable class="mb-4" />

            <VFileInput
v-model="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" label="Arquivo"
              placeholder="Selecione o arquivo do documento" prepend-icon="tabler-paperclip" class="mb-6" show-size
              required hint="Tipos permitidos: pdf, doc, docx, txt, jpg, png" persistent-hint />

            <div class="d-flex gap-4">
              <VBtn :loading="uploading" color="primary" type="submit">
                Enviar Documento
              </VBtn>
              <VBtn variant="text" color="secondary" @click="goBack">Voltar</VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
