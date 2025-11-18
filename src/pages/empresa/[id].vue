<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { $api } from '@/utils/api'
import { useCookie } from '@/@core/composable/useCookie.js'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)
const isEditInitial = computed(() => route.query.edit === 'true')

const empresa = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const saving = ref(false)

// Campos editáveis
const form = ref(null)
const nomeSocial = ref('')
const nomeFantasia = ref('')
const nif = ref('')
const tipoSocietario = ref('')
const capitalSocial = ref('')
const actividade = ref('')
const dataConstituicao = ref('')
const sedeEndereco = ref('')
const telefone = ref('')
const email = ref('')
const estadoLegal = ref('')

// Normalizador de decimal para backend (remove pontos de milhar, troca vírgula por ponto)
const toDecimalString = v => {
  if (v === null || v === undefined) return undefined
  const s = String(v).trim()
  if (!s) return undefined
  const normalized = s.replace(/\./g, '').replace(',', '.')
  
  return normalized
}

const isEdit = ref(false)

const fetchEmpresa = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const resp = await $api(`/empresas/${id.value}`)
    const emp = resp?.data ?? resp

    empresa.value = emp

    // Preencher campos
    nomeSocial.value = emp?.nomeSocial || ''
    nomeFantasia.value = emp?.nomeFantasia || ''
    nif.value = emp?.nif || ''
    tipoSocietario.value = emp?.tipoSocietario || ''
    capitalSocial.value = emp?.capitalSocial != null ? String(emp.capitalSocial) : ''
    actividade.value = emp?.actividade || ''
    dataConstituicao.value = emp?.dataConstituicao ? String(emp.dataConstituicao).substring(0, 10) : ''
    sedeEndereco.value = emp?.sedeEndereco || ''
    telefone.value = emp?.telefone || ''
    email.value = emp?.email || ''
    estadoLegal.value = emp?.estadoLegal || ''
    isEdit.value = !!isEditInitial.value
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao carregar empresa'
    console.error(err)
  } finally {
    loading.value = false
  }
}

watchEffect(() => { if (id.value) fetchEmpresa() })

const rules = { required: v => !!v || 'Obrigatório' }

const save = async () => {
  const result = await form.value?.validate()
  if (!result?.valid) return
  saving.value = true
  errorMsg.value = ''
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

    const updated = await $api(`/empresas/${id.value}`, { method: 'PATCH', body: payload })
    const updatedData = updated?.data ?? updated

    empresa.value = updatedData
    isEdit.value = false
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao atualizar empresa'
    console.error(err)
  } finally {
    saving.value = false
  }
}

const deleteDialog = ref(false)
const deleting = ref(false)

const deleteEmpresa = async () => {
  try {
    deleting.value = true
    await $api(`/empresas/${id.value}`, { method: 'DELETE' })
    router.push({ name: 'empresa-listar' })
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Erro ao eliminar empresa'
    console.error(err)
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

// Documentos da empresa
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const formatDate = d => (d ? new Date(d).toLocaleDateString() : '-')

const userDataCookie = useCookie('userData')
const currentUserId = computed(() => userDataCookie.value?.id)

const docForm = ref({
  tipoDocumento: '',
  numeroRef: '',
  validade: '',
  dataEmissao: '',
  file: null,
})

const addingDoc = ref(false)
const docsError = ref('')
const removingDocId = ref(null)

const addDocumentoEmpresa = async () => {
  docsError.value = ''
  if (!docForm.value.tipoDocumento || !docForm.value.file) {
    docsError.value = 'Tipo de documento e ficheiro são obrigatórios'
    
    return
  }
  addingDoc.value = true
  try {
    const fd = new FormData()

    fd.append('file', Array.isArray(docForm.value.file) ? docForm.value.file[0] : docForm.value.file)
    fd.append('title', (Array.isArray(docForm.value.file) ? docForm.value.file[0]?.name : docForm.value.file?.name) || docForm.value.tipoDocumento)
    if (currentUserId.value) fd.append('idUser', String(currentUserId.value))

    const uploaded = await $api('/document/upload', { method: 'POST', body: fd })
    const doc = uploaded?.data ?? uploaded

    await $api('/documento-empresa', {
      method: 'POST',
      body: {
        empresaId: id.value,
        tipoDocumento: docForm.value.tipoDocumento,
        numeroRef: docForm.value.numeroRef || undefined,
        ficheiro: doc.filePath,
        validade: docForm.value.validade || undefined,
        dataEmissao: docForm.value.dataEmissao || undefined,
        metadata: { documentId: doc.id },
      },
    })

    // Atualizar empresa e limpar formulário
    await fetchEmpresa()
    docForm.value = { tipoDocumento: '', numeroRef: '', validade: '', dataEmissao: '', file: null }
  } catch (err) {
    docsError.value = err?.data?.message || 'Erro ao adicionar documento'
    console.error(err)
  } finally {
    addingDoc.value = false
  }
}

const openDocumento = async doc => {
  const documentId = doc?.metadata?.documentId
  if (documentId) {
    try {
      const resp = await $api(`/document/${documentId}/download-url`)
      const url = resp?.url ?? resp?.data?.url
      if (url) window.open(url, '_blank')
      else window.open(`${apiBase}/document/${documentId}/download`, '_blank')
    } catch (err) {
      console.error(err)
      window.open(`${apiBase}/document/${documentId}/download`, '_blank')
    }
  } else if (doc?.ficheiro) {
    // Quando não há documentId, tentar abrir via URL presignado baseada na chave
    try {
      const path = doc.ficheiro

      // Fallback simples: apenas abrir caminho se for um URL absoluto
      if (/^https?:\/\//i.test(path)) {
        window.open(path, '_blank')
      }
    } catch (err) {
      console.error(err)
    }
  }
}

const removeDocumento = async doc => {
  docsError.value = ''
  removingDocId.value = doc.id
  try {
    await $api(`/documento-empresa/${doc.id}`, { method: 'DELETE' })
    await fetchEmpresa()
  } catch (err) {
    docsError.value = err?.data?.message || 'Erro ao remover documento'
    console.error(err)
  } finally {
    removingDocId.value = null
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Empresa: {{ empresa?.nomeSocial || 'Detalhes' }}</span>
          <div class="d-flex gap-2">
            <VBtn variant="text" color="info" @click="isEdit = !isEdit">
              <VIcon icon="tabler-pencil" class="me-2" />
              {{ isEdit ? 'Cancelar edição' : 'Editar' }}
            </VBtn>
            <VBtn variant="text" color="error" @click="deleteDialog = true">
              <VIcon icon="tabler-trash" class="me-2" />
              Eliminar
            </VBtn>
          </div>
        </VCardTitle>
        <VCardText>
          <VAlert v-if="errorMsg" type="error" variant="tonal" class="mb-4">{{ errorMsg }}</VAlert>

          <template v-if="loading">
            <div class="py-6 d-flex justify-center">
              <VProgressCircular indeterminate color="primary" />
            </div>
          </template><template v-else>
            <template v-if="isEdit">
              <VForm ref="form" @submit.prevent="save">
              <VRow>
                <VCol cols="12" md="6">
                  <VTextField v-model="nomeSocial" label="Nome Social" :rules="[rules.required]" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="nomeFantasia" label="Nome Fantasia" />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField v-model="nif" label="NIF" :rules="[rules.required]" />
                </VCol>
                <VCol cols="12" md="6">
                  <VTextField v-model="tipoSocietario" label="Tipo Societário" />
                </VCol>

                <VCol cols="12" md="6">
                  <VTextField
v-model="capitalSocial" label="Capital Social" type="text" inputmode="decimal"
                    placeholder="Ex.: 1.234,56" />
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
                <VBtn color="primary" type="submit" :loading="saving">
                  <VIcon icon="tabler-device-floppy" class="me-2" />
                  Guardar alterações
                </VBtn>
                <VBtn variant="text" @click="isEdit = false">Cancelar</VBtn>
              </div>
            </VForm>

            <!-- Documentos da Empresa (Edição) -->
            <VDivider class="my-6" />
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-h6">Documentos da Empresa</span>
            </div>
            <VAlert v-if="docsError" type="error" variant="tonal" class="mb-4">{{ docsError }}</VAlert>
            <VRow class="mb-4">
              <VCol cols="12" md="4">
                <VTextField v-model="docForm.tipoDocumento" label="Tipo de documento" />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField v-model="docForm.numeroRef" label="Número de referência" />
              </VCol>
              <VCol cols="12" md="4">
                <VFileInput v-model="docForm.file" label="Selecionar ficheiro" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField v-model="docForm.dataEmissao" label="Data de emissão" type="date" />
              </VCol>
              <VCol cols="12" md="4">
                <VTextField v-model="docForm.validade" label="Validade" type="date" />
              </VCol>
              <VCol cols="12" md="12">
                <VBtn color="primary" @click="addDocumentoEmpresa" :loading="addingDoc">
                  <VIcon icon="tabler-upload" class="me-2" />
                  Adicionar documento
                </VBtn>
              </VCol>
            </VRow>

            <VTable density="comfortable" class="mb-6">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nº Ref</th>
                  <th>Emissão</th>
                  <th>Validade</th>
                  <th>Ficheiro</th>
                  <th>Atualizado</th>
                  <th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in empresa?.documentos || []" :key="doc.id">
                  <td>{{ doc.tipoDocumento }}</td>
                  <td>{{ doc.numeroRef || '-' }}</td>
                  <td>{{ formatDate(doc.dataEmissao) }}</td>
                  <td>{{ formatDate(doc.validade) }}</td>
                  <td>{{ doc.ficheiro?.split('/')?.pop() }}</td>
                  <td>{{ formatDate(doc.updatedAt) }}</td>
                  <td class="text-end">
                    <VBtn size="small" variant="text" color="primary" @click="openDocumento(doc)">
                      <VIcon icon="tabler-eye" class="me-1" /> Visualizar
                    </VBtn>
                    <VBtn size="small" variant="text" color="error" :loading="removingDocId === doc.id" @click="removeDocumento(doc)">
                      <VIcon icon="tabler-trash" class="me-1" /> Remover
                    </VBtn>
                  </td>
                </tr>
                <tr v-if="(empresa?.documentos?.length ?? 0) === 0">
                  <td colspan="7" class="text-center text-medium-emphasis">Sem documentos</td>
                </tr>
              </tbody>
            </VTable>

            </template>
            
            <template v-else>
              <VRow>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Nome Social</p>
                  <p>{{ empresa?.nomeSocial }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Nome Fantasia</p>
                  <p>{{ empresa?.nomeFantasia || '-' }}</p>
                </VCol>

                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">NIF</p>
                  <p>{{ empresa?.nif }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Tipo Societário</p>
                  <p>{{ empresa?.tipoSocietario || '-' }}</p>
                </VCol>

                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Capital Social</p>
                  <p>{{ empresa?.capitalSocial != null ? (Number.isFinite(Number(empresa.capitalSocial)) ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(empresa.capitalSocial)) : String(empresa.capitalSocial)) : '-' }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Actividade</p>
                  <p>{{ empresa?.actividade || '-' }}</p>
                </VCol>

                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Data de Constituição</p>
                  <p>{{ empresa?.dataConstituicao ? new Date(empresa.dataConstituicao).toLocaleDateString() : '-' }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Sede / Endereço</p>
                  <p>{{ empresa?.sedeEndereco || '-' }}</p>
                </VCol>

                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Telefone</p>
                  <p>{{ empresa?.telefone || '-' }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Email</p>
                  <p>{{ empresa?.email || '-' }}</p>
                </VCol>

                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Estado Legal</p>
                  <p>{{ empresa?.estadoLegal || '-' }}</p>
                </VCol>
              </VRow>

              <!-- Relações resumidas se retornarem -->
              <VDivider class="my-6" />
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-h6">Relacionamentos</span>
              </div>
              <VRow>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Departamentos</p>
                  <p>{{ empresa?.departamentos?.length ?? 0 }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Usuários</p>
                  <p>{{ empresa?.usuarios?.length ?? 0 }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Processos</p>
                  <p>{{ empresa?.processos?.length ?? 0 }}</p>
                </VCol>
                <VCol cols="12" md="6">
                  <p class="text-subtitle-2 mb-1">Documentos</p>
                  <p>{{ empresa?.documentos?.length ?? 0 }}</p>
                </VCol>
              </VRow>

              <VDivider class="my-6" />
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-h6">Documentos</span>
              </div>
              <VTable density="comfortable">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nº Ref</th>
                    <th>Emissão</th>
                    <th>Validade</th>
                    <th>Ficheiro</th>
                    <th>Atualizado</th>
                    <th class="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="doc in empresa?.documentos || []" :key="doc.id">
                    <td>{{ doc.tipoDocumento }}</td>
                    <td>{{ doc.numeroRef || '-' }}</td>
                    <td>{{ formatDate(doc.dataEmissao) }}</td>
                    <td>{{ formatDate(doc.validade) }}</td>
                    <td>{{ doc.ficheiro?.split('/')?.pop() }}</td>
                    <td>{{ formatDate(doc.updatedAt) }}</td>
                    <td class="text-end">
                      <VBtn size="small" variant="text" color="primary" @click="openDocumento(doc)">
                        <VIcon icon="tabler-eye" class="me-1" /> Visualizar
                      </VBtn>
                    </td>
                  </tr>
                  <tr v-if="(empresa?.documentos?.length ?? 0) === 0">
                    <td colspan="7" class="text-center text-medium-emphasis">Sem documentos</td>
                  </tr>
                </tbody>
              </VTable>

            </template>
          </template>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Delete dialog -->
  <VDialog v-model="deleteDialog" max-width="420">
    <VCard>
      <VCardTitle>Remover empresa</VCardTitle>
      <VCardText>
        Tem certeza que deseja eliminar a empresa "{{ empresa?.nomeSocial }}"? Esta ação não pode ser desfeita.
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="deleteDialog = false">Cancelar</VBtn>
        <VBtn color="error" :loading="deleting" @click="deleteEmpresa">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
