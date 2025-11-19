<script setup>
import CrudPage from '@/components/crud/CrudPage.vue'

const download = async doc => {
  try {
    const resp = await $api(`/document/${doc.id}/download-url`)
    const url = resp?.url ?? resp?.data?.url
    if (url) {
      window.open(url, '_blank')
      
      return
    }

    // Fallback
    const blob = await $api(`/document/${doc.id}/download`, { responseType: 'blob' })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = objectUrl
    a.download = (doc.title || 'documento')
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (err) {
    console.error(err)
  }
}

</script>

<template>
  <CrudPage
resource="/signature" title="Assinaturas"
    :fields="[{ key: 'document.title', label: 'Documento' }, { key: 'signedAt', label: 'Assinatura' }, { key: 'user.name', label: 'Usuário' }, { key: 'user.email', label: 'E-mail' }]"
    :show-add-button="false"
    :actions="{
      edit: false, custom: [
        { key: 'download', label: 'Baixar', icon: 'tabler-download', color: 'success', handler: item => download(item.document) },

      ]
    }"
/>
</template>
