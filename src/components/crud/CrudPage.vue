<script setup>
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'
import { createUrl } from '@/@core/composable/createUrl'

const props = defineProps({
  resource: { type: String, required: true },
  title: { type: String, default: '' },
  fields: { type: Array, default: () => [] },
  dateFormat: { type: String, default: 'pt-PT' },
  dateFormatter: { type: Function, default: undefined },
  actions: { type: Object, default: () => ({ view: false, edit: true, delete: false, custom: [] }) },
  showAddButton: { type: Boolean, default: true },
  addButtonText: { type: String, default: 'Adicionar' },
  addButtonHandler: { type: Function, default: undefined },
  refreshKey: { type: [Number, String], default: 0 },
  preSave: { type: Function, default: undefined },
  customCells: { type: Array, default: () => [] },
  createEndpoint: { type: String, default: '' },
  updateEndpoint: { type: String, default: '' },
  paginationQueryMode: { type: String, default: 'page' },
  limitParam: { type: String, default: 'limit' },
  offsetParam: { type: String, default: 'offset' },
  pageParam: { type: String, default: 'page' },
})

const emit = defineEmits(['add', 'create', 'update', 'delete', 'view', 'edit', 'action'])

const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')

const offsetRef = computed(() => Math.max(0, (page.value - 1) * itemsPerPage.value))

const queryParams = computed(() => {
  const q = { search }
  if (props.paginationQueryMode === 'offset') {
    return { [props.limitParam]: itemsPerPage, [props.offsetParam]: offsetRef, search }
  } else {
    return { [props.pageParam]: page, [props.limitParam]: itemsPerPage, search }
  }
})

const { data, execute: fetchData, isFetching, error } = await useApi(createUrl(props.resource, { query: queryParams }))
const items = computed(() => data.value?.data?.data || data.value?.data || (Array.isArray(data.value) ? data.value : []))
const totalItems = computed(() => {
  const root = data.value
  const nested = root?.data?.pagination?.total
  const pagination = root?.pagination?.total
  const meta = root?.meta?.total
  const total = root?.total
  const fallback = Array.isArray(items.value) ? items.value.length : 0

  return nested ?? pagination ?? meta ?? total ?? fallback
})

const displayItems = computed(() => {
  const arr = Array.isArray(items.value) ? items.value : []
  
  return arr.map(it => {
    const copy = JSON.parse(JSON.stringify(it))

    headers.value.forEach(h => {
      const k = h.key
      if (k === 'actions') return
      const val = get(copy, k)
      if (isDateKey(k) || isDateValue(val)) {
        const formatted = formatDate(val)
        const parts = String(k).split('.')
        let cur = copy
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i]
          if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {}
          cur = cur[p]
        }
        cur[parts[parts.length - 1]] = formatted
      }
    })
    
    return copy
  })
})

const dialog = ref(false)
const editing = ref(null)
const form = ref({})
const saving = ref(false)
const saveError = ref('')

const headers = computed(() => {
  const base = props.fields.length ? props.fields.map(f => ({ title: f.label || f.key, key: f.key })) : [
    { title: 'ID', key: 'id' },
    { title: 'Criado em', key: 'createdAt' },
    { title: 'Atualizado em', key: 'updatedAt' },
  ]

  
  return [...base, { title: 'Ações', key: 'actions', sortable: false }]
})

const customSlotHeaders = computed(() => headers.value.filter(h => props.customCells.includes(h.key) && h.key !== 'actions'))

const openCreate = () => { editing.value = null; form.value = {}; dialog.value = true }
const openEdit = item => { editing.value = item; form.value = { ...item }; dialog.value = true; emit('edit', item) }
const closeDialog = () => { dialog.value = false; form.value = {}; editing.value = null; saveError.value = '' }

const removeId = ref(null)
const removeError = ref('')

const save = async () => {
  saveError.value = ''
  saving.value = true
  try {
    const pre = await props.preSave?.(form.value, editing.value)
    if (pre === false) { saving.value = false 
      
      return }
    const payload = (pre && typeof pre === 'object') ? pre : form.value
    if (editing.value?.id) {
      const base = props.updateEndpoint || props.resource

      await $api(`${base}/${editing.value.id}`, { method: 'PATCH', body: payload })
      emit('update', { id: editing.value.id, data: payload })
    } else {
      const endpoint = props.createEndpoint || props.resource
      const created = await $api(endpoint, { method: 'POST', body: payload })

      emit('create', created)
    }
    closeDialog()
    await fetchData()
  } catch (err) {
    saveError.value = err?.data?.message || 'Falha ao guardar'
  } finally {
    saving.value = false
  }
}

const removeItem = async item => {
  removeError.value = ''
  removeId.value = item.id
  try {
    await $api(`${props.resource}/${item.id}`, { method: 'DELETE' })
    emit('delete', item)
    await fetchData()
  } catch (err) {
    removeError.value = err?.data?.message || 'Falha ao eliminar'
  } finally {
    removeId.value = null
  }
}

const get = (obj, path) => { try { return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj) } catch { return undefined } }
const isDateKey = key => ['createdAt', 'updatedAt', 'submittedAt', 'expiresAt', 'dueDate', 'startDate', 'endDate', 'signedAt'].includes(key)

const isDateValue = val => { if (!val) return false; const d = typeof val === 'string' ? new Date(val) : val 

  return d instanceof Date && !isNaN(d.getTime()) }

const formatDate = val => {
  if (!val) return '-'
  const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : val
  if (!(d instanceof Date) || isNaN(d.getTime())) return String(val)
  if (props.dateFormatter) return props.dateFormatter(d)

  const fmt = new Intl.DateTimeFormat(props.dateFormat, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })

  
  return fmt.format(d)
}

const onAddClick = () => { if (props.addButtonHandler) { props.addButtonHandler(); emit('add') 

  return } emit('add'); openCreate() }

watch(() => props.refreshKey, () => { fetchData() })
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center justify-space-between">
      <div class="d-flex align-center flex-wrap gap-3 w-80">
        <slot name="header-left">
          <VTextField v-model="search" placeholder="Pesquisar" density="comfortable" hide-details clearable prepend-inner-icon="tabler-search" class="flex-grow-1" style="min-width: 360px; width: clamp(360px, 50vw, 720px)" />
        </slot>
      </div>
      <div>
        <slot name="add-button">
          <VBtn v-if="showAddButton" color="primary" @click="onAddClick">
{{ addButtonText }}
</VBtn>
        </slot>
      </div>
    </VCardTitle>
    <VCardText v-if="error" class="py-0">
      <VAlert type="error" variant="tonal" class="mb-4">
{{ (error && error.message) || 'Falha ao carregar' }}
</VAlert>
    </VCardText>
    <VDataTableServer v-model:page="page" v-model:items-per-page="itemsPerPage" :headers="headers" :items="displayItems" :items-length="totalItems" :loading="isFetching" class="text-no-wrap">
      <template v-for="h in customSlotHeaders" v-slot:[`item.${h.key}`]="{ item }">
        <slot :name="`item.${h.key}`" :item="item">
          {{ get(item, h.key) ?? item[h.key] ?? '-' }}
        </slot>
      </template>
      <template #item.actions="{ item }">
        <slot name="actions" :item="item" :remove="removeItem" :edit="openEdit" :view="() => emit('view', item)">
          <div class="d-flex gap-2">
            <VBtn v-if="actions?.view" size="small" variant="text" color="primary" @click="emit('view', item)">
<VIcon icon="tabler-eye" />
</VBtn>
            <VBtn v-if="actions?.edit" size="small" variant="text" color="info" @click="openEdit(item)">
<VIcon icon="tabler-pencil" />
</VBtn>
            <VBtn v-if="actions?.delete" size="small" variant="text" color="error" :loading="removeId === item.id" @click="removeItem(item)">
<VIcon icon="tabler-trash" />
</VBtn>
            <template v-for="act in (actions?.custom || [])" :key="act.key || act.label">
              <VBtn size="small" variant="text" :color="act.color || 'secondary'" @click="() => { act?.handler?.(item); emit('action', { action: act.key || act.label, item }) }">
<VIcon :icon="act.icon || 'tabler-dots'" />
</VBtn>
            </template>
          </div>
        </slot>
      </template>
    </VDataTableServer>

    <VDialog v-model="dialog" max-width="640">
      <VCard>
        <VCardTitle>{{ editing ? 'Editar' : 'Adicionar' }}</VCardTitle>
        <VCardText>
          <VAlert v-if="saveError" type="error" variant="tonal" class="mb-4">
{{ saveError }}
</VAlert>
          <VForm @submit.prevent="save">
            <VRow>
              <slot name="form-fields" :form="form" :editing="editing" :close="closeDialog">
                <template v-if="fields.length">
                  <VCol v-for="f in fields" :key="f.key" cols="12" md="6">
                    <VTextField v-model="form[f.key]" :label="f.label || f.key" :type="f.type || 'text'" :required="!!f.required" />
                  </VCol>
                </template>
                <template v-else>
                  <VCol cols="12">
                    <VTextField v-model="form.title" label="Título" />
                  </VCol>
                  <VCol cols="12">
                    <VTextField v-model="form.description" label="Descrição" />
                  </VCol>
                </template>
              </slot>
            </VRow>
            <VCardActions>
              <VSpacer />
              <VBtn variant="text" @click="closeDialog">
Cancelar
</VBtn>
              <VBtn color="primary" type="submit" :loading="saving">
Guardar
</VBtn>
            </VCardActions>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </VCard>
</template>
