<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'
</script>

<template>
  <CrudPage 
    resource="/workflow" 
    title="Workflows"
    :fields="[{ key: 'name', label: 'Nome', required: true }, { key: 'status', label: 'Status' }, { key: 'version', label: 'Versão', type: 'number' }]"
    :custom-cells="['status']"
    :actions="{ view: true, edit: true }"
    >
    <template #item.status="{ item }">
      <VChip
        :color="item.status === 'ACTIVE' ? 'success' : item.status === 'DRAFT' ? 'info' : item.status === 'INACTIVE' ? 'warning' : 'default'"
        size="small"
      >
        {{
          item.status === 'DRAFT'
            ? 'Rascunho'
            : item.status === 'ACTIVE'
              ? 'Ativo'
              : item.status === 'INACTIVE'
                ? 'Inativo'
                : 'Arquivado'
        }}
      </VChip>
    </template>
  </CrudPage>
</template>
