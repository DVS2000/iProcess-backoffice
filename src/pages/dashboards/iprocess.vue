<script setup>
import { useTheme } from 'vuetify'
import ActivityTimeline from '@/views/pages/user-profile/profile/ActivityTimeline.vue'
import { getDonutChartConfig, getBarChartConfig } from '@core/libs/apex-chart/apexCharConfig'

const vuetifyTheme = useTheme()
const activeTab = ref('overview')

// 👉 Dados mockados baseados nos módulos do iprocess-api
const widgetData = [
  { title: 'Usuários', value: 128, icon: 'tabler-users', color: 'primary' },
  { title: 'Empresas', value: 12, icon: 'tabler-building', color: 'info' },
  { title: 'Departamentos', value: 34, icon: 'tabler-stack-2', color: 'warning' },
  { title: 'Documentos', value: 986, icon: 'tabler-file-text', color: 'success' },
  { title: 'Versões de Documento', value: 4321, icon: 'tabler-file-diff', color: 'secondary' },
  { title: 'Processos', value: 58, icon: 'tabler-a-b', color: 'primary' },
  { title: 'Workflows', value: 27, icon: 'tabler-flowchart', color: 'info' },
  { title: 'Tarefas', value: 324, icon: 'tabler-list-check', color: 'error' },
]

// 👉 Charts mockados
const tasksByStatusSeries = [45, 120, 98, 61]
const tasksByStatusLabels = ['Pendente', 'Em Progresso', 'Concluída', 'Bloqueada']

const tasksByStatusOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)

  return { ...cfg, labels: tasksByStatusLabels, legend: { position: 'bottom' } }
})

const workflowsByProcessSeries = [{
  data: [10, 6, 4, 7, 3, 5],
}]

const workflowsByProcessCategories = ['Onboarding', 'Compliance', 'Financeiro', 'Operações', 'RH', 'Jurídico']

const workflowsByProcessOptions = computed(() => {
  const cfg = getBarChartConfig(vuetifyTheme.current.value)
  
  return {
    ...cfg,
    xaxis: { ...cfg.xaxis, categories: workflowsByProcessCategories },
    plotOptions: { ...cfg.plotOptions, bar: { borderRadius: 6, columnWidth: '40%' } },
    legend: { show: false },
  }
})

// 👉 Organização (Usuários, Roles, Permissões, Empresas, Departamentos)
const orgStats = [
  { title: 'Usuários', value: 128, icon: 'tabler-users', color: 'primary' },
  { title: 'Perfis (Roles)', value: 7, icon: 'tabler-shield', color: 'success' },
  { title: 'Permissões', value: 42, icon: 'tabler-key', color: 'secondary' },
  { title: 'Empresas', value: 12, icon: 'tabler-building', color: 'info' },
  { title: 'Departamentos', value: 34, icon: 'tabler-stack-2', color: 'warning' },
]

const usersByDeptSeries = [{ data: [22, 18, 16, 12, 10] }]
const usersByDeptCategories = ['Operações', 'Financeiro', 'RH', 'Compliance', 'Jurídico']

const usersByDeptOptions = computed(() => {
  const cfg = getBarChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, xaxis: { ...cfg.xaxis, categories: usersByDeptCategories }, plotOptions: { ...cfg.plotOptions, bar: { borderRadius: 6 } } }
})

const orgUsersHeaders = [
  { title: 'Nome', key: 'nome' },
  { title: 'Email', key: 'email' },
  { title: 'Departamento', key: 'departamento' },
  { title: 'Perfil', key: 'perfil' },
]

const orgUsersItems = [
  { nome: 'João Silva', email: 'joao@empresa.com', departamento: 'Operações', perfil: 'MANAGER' },
  { nome: 'Maria Costa', email: 'maria@empresa.com', departamento: 'Compliance', perfil: 'ANALYST' },
  { nome: 'Carlos Lima', email: 'carlos@empresa.com', departamento: 'Financeiro', perfil: 'ADMIN' },
  { nome: 'Ana Sousa', email: 'ana@empresa.com', departamento: 'RH', perfil: 'USER' },
]

// 👉 Documentos (Documentos, Versões, Pastas, Permissões de Pasta, Assinaturas)
const docStats = [
  { title: 'Documentos', value: 986, icon: 'tabler-file-text', color: 'success' },
  { title: 'Versões', value: 4321, icon: 'tabler-file-diff', color: 'secondary' },
  { title: 'Pastas', value: 154, icon: 'tabler-folders', color: 'info' },
  { title: 'Permissões de Pasta', value: 702, icon: 'tabler-lock', color: 'warning' },
  { title: 'Assinaturas', value: 83, icon: 'tabler-pencil', color: 'primary' },
]

const docsByStatusSeries = [420, 280, 210, 76]
const docsByStatusLabels = ['Publicado', 'Em Revisão', 'Rascunho', 'Arquivado']

const docsByStatusOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, labels: docsByStatusLabels, legend: { position: 'bottom' } }
})

const docHeaders = [
  { title: 'Título', key: 'titulo' },
  { title: 'Status', key: 'status' },
  { title: 'Última Versão', key: 'versao' },
  { title: 'Pasta', key: 'pasta' },
]

const docItems = [
  { titulo: 'Política de Segurança', status: 'Publicado', versao: 'v5', pasta: 'Compliance' },
  { titulo: 'Procedimento Operacional', status: 'Em Revisão', versao: 'v2', pasta: 'Operações' },
  { titulo: 'Manual Financeiro', status: 'Publicado', versao: 'v8', pasta: 'Financeiro' },
  { titulo: 'Código de Conduta', status: 'Arquivado', versao: 'v3', pasta: 'Jurídico' },
]

// 👉 Processos & Workflows
const pwStats = [
  { title: 'Processos', value: 58, icon: 'tabler-a-b', color: 'primary' },
  { title: 'Workflows', value: 27, icon: 'tabler-flowchart', color: 'info' },
  { title: 'Instâncias', value: 142, icon: 'tabler-chart-arcs', color: 'success' },
  { title: 'Tarefas', value: 324, icon: 'tabler-list-check', color: 'error' },
  { title: 'Etapas', value: 89, icon: 'tabler-stairs', color: 'secondary' },
]

const instancesByStatusSeries = [72, 48, 22]
const instancesByStatusLabels = ['Ativa', 'Concluída', 'Cancelada']

const instancesByStatusOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, labels: instancesByStatusLabels, legend: { position: 'bottom' } }
})

const tasksByPrioritySeries = [140, 126, 58]
const tasksByPriorityLabels = ['Alta', 'Média', 'Baixa']

const tasksByPriorityOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, labels: tasksByPriorityLabels, legend: { position: 'bottom' } }
})

const processHeaders = [
  { title: 'Nome', key: 'nome' },
  { title: 'Empresa', key: 'empresa' },
  { title: 'Workflow', key: 'workflow' },
  { title: 'Status', key: 'status' },
]

const processItems = [
  { nome: 'Onboarding', empresa: 'SpeedNet', workflow: 'Onboarding v2', status: 'Ativo' },
  { nome: 'Compliance', empresa: 'SpeedNet', workflow: 'Compliance v3', status: 'Ativo' },
  { nome: 'Financeiro', empresa: 'SpeedNet', workflow: 'Finance v1', status: 'Pausado' },
]

const workflowHeaders = [
  { title: 'Nome', key: 'nome' },
  { title: 'Versão', key: 'versao' },
  { title: 'Nós', key: 'nos' },
  { title: 'Variáveis', key: 'variaveis' },
]

const workflowItems = [
  { nome: 'Onboarding', versao: 'v2', nos: 12, variaveis: 18 },
  { nome: 'Compliance', versao: 'v3', nos: 9, variaveis: 14 },
  { nome: 'Financeiro', versao: 'v1', nos: 7, variaveis: 9 },
]

// 👉 Formulários
const formStats = [
  { title: 'Formulários', value: 42, icon: 'tabler-forms', color: 'primary' },
  { title: 'Respostas', value: 1130, icon: 'tabler-list-details', color: 'success' },
]

const responsesByFormSeries = [{ data: [220, 180, 160, 140, 120] }]
const responsesByFormCategories = ['Onboarding', 'Qualidade', 'Auditoria', 'RH', 'Operações']

const responsesByFormOptions = computed(() => {
  const cfg = getBarChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, xaxis: { ...cfg.xaxis, categories: responsesByFormCategories }, plotOptions: { ...cfg.plotOptions, bar: { borderRadius: 6 } } }
})

const formHeaders = [
  { title: 'Formulário', key: 'form' },
  { title: 'Respostas', key: 'respostas' },
  { title: 'Última Atualização', key: 'atualizado' },
]

const formItems = [
  { form: 'Onboarding', respostas: 220, atualizado: '2025-10-11' },
  { form: 'Qualidade', respostas: 180, atualizado: '2025-10-09' },
  { form: 'Auditoria', respostas: 160, atualizado: '2025-10-07' },
]

// 👉 Políticas & Regras (Compliance Policy, Automation Rule)
const policyStats = [
  { title: 'Políticas de Compliance', value: 18, icon: 'tabler-scale', color: 'warning' },
  { title: 'Regras de Automação', value: 26, icon: 'tabler-settings', color: 'secondary' },
]

const complianceByStatusSeries = [8, 7, 3]
const complianceByStatusLabels = ['Vigente', 'Em Revisão', 'Arquivada']

const complianceByStatusOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, labels: complianceByStatusLabels, legend: { position: 'bottom' } }
})

const rulesHeaders = [
  { title: 'Regra', key: 'regra' },
  { title: 'Gatilho', key: 'gatilho' },
  { title: 'Ação', key: 'acao' },
  { title: 'Status', key: 'status' },
]

const rulesItems = [
  { regra: 'Notificar gestor', gatilho: 'Instância atrasada', acao: 'Enviar email', status: 'Ativa' },
  { regra: 'Criar tarefa revisão', gatilho: 'Documento novo', acao: 'Criar tarefa', status: 'Ativa' },
  { regra: 'Arquivar workflow', gatilho: 'Instância concluída', acao: 'Arquivar', status: 'Inativa' },
]

// 👉 Comunicação (Notificações & Calendário)
const commStats = [
  { title: 'Notificações', value: 240, icon: 'tabler-bell', color: 'info' },
  { title: 'Eventos de Calendário', value: 37, icon: 'tabler-calendar', color: 'primary' },
]

const notifHeaders = [
  { title: 'Assunto', key: 'assunto' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Destinatário', key: 'destinatario' },
  { title: 'Data', key: 'data' },
]

const notifItems = [
  { assunto: 'Instância atrasada', tipo: 'Alerta', destinatario: 'Gestor Operações', data: '2025-10-03' },
  { assunto: 'Novo documento', tipo: 'Info', destinatario: 'Equipe Compliance', data: '2025-10-02' },
  { assunto: 'Reunião RH', tipo: 'Evento', destinatario: 'Todos RH', data: '2025-10-01' },
]

// 👉 Licenciamento (Licenças / módulos)
const licenseStats = [
  { title: 'Módulos Ativos', value: 7, icon: 'tabler-license', color: 'success' },
  { title: 'Renovações Próximas', value: 2, icon: 'tabler-alert-circle', color: 'warning' },
]

const licenseHeaders = [
  { title: 'Módulo', key: 'modulo' },
  { title: 'Status', key: 'status' },
  { title: 'Expira em', key: 'expira' },
]

const licenseItems = [
  { modulo: 'Processos', status: 'Ativo', expira: '2026-01-10' },
  { modulo: 'Workflows', status: 'Ativo', expira: '2026-02-20' },
  { modulo: 'Formulários', status: 'Pendente', expira: '2025-11-05' },
]

// 👉 Sistema (Menus & Workflow Nodes)
const systemStats = [
  { title: 'Menus', value: 12, icon: 'tabler-menu-2', color: 'info' },
  { title: 'Workflow Nodes', value: 48, icon: 'tabler-hierarchy-2', color: 'secondary' },
]

const menuHeaders = [
  { title: 'Menu', key: 'menu' },
  { title: 'Caminho', key: 'path' },
  { title: 'Ícone', key: 'icone' },
  { title: 'Ordem', key: 'ordem' },
]

const menuItems = [
  { menu: 'Dashboards', path: '/dashboards', icone: 'tabler-dashboard', ordem: 1 },
  { menu: 'Processos', path: '/processos', icone: 'tabler-file-text', ordem: 2 },
  { menu: 'Workflows', path: '/workflows', icone: 'tabler-repeat', ordem: 3 },
]

const nodesByTypeSeries = [14, 22, 12]
const nodesByTypeLabels = ['Start', 'Action', 'Decision']

const nodesByTypeOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, labels: nodesByTypeLabels, legend: { position: 'bottom' } }
})

const nodeHeaders = [
  { title: 'Node', key: 'node' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Workflow', key: 'workflow' },
]

const nodeItems = [
  { node: 'Start-01', tipo: 'Start', workflow: 'Onboarding' },
  { node: 'Action-12', tipo: 'Action', workflow: 'Qualidade' },
  { node: 'Decision-03', tipo: 'Decision', workflow: 'Auditoria' },
]

// 👉 Tabela de tarefas recentes (mock)
const taskHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Responsável', key: 'responsavel' },
  { title: 'Estado', key: 'estado' },
  { title: 'Prioridade', key: 'prioridade' },
  { title: 'Prazo', key: 'prazo' },
]

const taskItems = [
  { id: 'T-1001', tipo: 'Workflow Task', responsavel: 'João Silva', estado: 'Em Progresso', prioridade: 'Alta', prazo: '2025-11-02' },
  { id: 'T-1002', tipo: 'Aprovação Documento', responsavel: 'Maria Costa', estado: 'Pendente', prioridade: 'Média', prazo: '2025-11-05' },
  { id: 'T-1003', tipo: 'Revisão Processo', responsavel: 'Carlos Lima', estado: 'Concluída', prioridade: 'Baixa', prazo: '2025-10-10' },
  { id: 'T-1004', tipo: 'Assinatura', responsavel: 'Ana Sousa', estado: 'Bloqueada', prioridade: 'Alta', prazo: '2025-10-20' },
]

// 👉 Ações rápidas (somente UI por enquanto)
const quickActions = [
  { text: 'Novo Documento', icon: 'tabler-file-plus' },
  { text: 'Novo Processo', icon: 'tabler-a-b' },
  { text: 'Novo Workflow', icon: 'tabler-flowchart' },
]

definePage({ meta: { navActiveLink: 'dashboards-iprocess', action: 'manage', subject: 'all' } })
</script>

<template>
  <div>
    <!-- 👉 Abas de navegação interna -->
    <VTabs v-model="activeTab" class="mb-6" grow>
      <VTab value="overview">
Visão Geral
</VTab>
      <VTab value="organizacao">
Organização
</VTab>
      <VTab value="documentos">
Documentos
</VTab>
      <VTab value="processos">
Processos & Workflows
</VTab>
      <VTab value="formularios">
Formulários
</VTab>
      <VTab value="regras">
Políticas & Regras
</VTab>
      <VTab value="comunicacao">
Comunicação
</VTab>
      <VTab value="licenciamento">
Licenciamento
</VTab>
      <VTab value="sistema">
Sistema
</VTab>
    </VTabs>

    <VWindow v-model="activeTab">
      <VWindowItem value="overview">
        <!-- 👉 Bem-vindo + Ações rápidas -->
        <VCard class="mb-6">
          <VCardText>
            <div class="d-flex justify-space-between align-center flex-wrap gap-4">
              <div>
                <h4 class="text-h4 mb-1">
Bem-vindo ao iProcess 👋
</h4>
                <div class="text-body-1">
Gestão de processos, documentos e workflows
</div>
              </div>
              <div class="d-flex align-center flex-wrap gap-3">
                <VBtn
v-for="action in quickActions" :key="action.text" color="primary" variant="tonal"
                  :prepend-icon="action.icon"
>
                  {{ action.text }}
                </VBtn>
              </div>
            </div>
          </VCardText>
        </VCard>

        <!-- 👉 Widgets de estatísticas -->
        <VCard class="mb-6">
          <VCardText class="px-3">
            <VRow>
              <VCol v-for="(data, idx) in widgetData" :key="data.title" cols="12" sm="6" md="3" class="px-6">
                <div
class="d-flex justify-space-between" :class="$vuetify.display.xs
                  ? idx !== widgetData.length - 1 ? 'border-b pb-4' : ''
                  : $vuetify.display.sm
                    ? idx < (widgetData.length / 2) ? 'border-b pb-4' : ''
                    : ''"
>
                  <div>
                    <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                    <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                  </div>
                  <VAvatar rounded :color="data.color" variant="tonal">
                    <VIcon :icon="data.icon" />
                  </VAvatar>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- 👉 Charts -->
        <VRow class="match-height mb-6">
          <VCol cols="12" md="6">
            <VCard title="Tarefas por Estado">
              <VCardText>
                <VueApexCharts
type="donut" height="320" :options="tasksByStatusOptions"
                  :series="tasksByStatusSeries"
/>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Workflows ativos por Processo">
              <VCardText>
                <VueApexCharts type="bar" height="320" :options="workflowsByProcessOptions" :series="workflowsByProcessSeries" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- 👉 Tarefas recentes -->
        <VCard title="Tarefas recentes" class="mb-6">
          <VCardText>
            <VDataTable :headers="taskHeaders" :items="taskItems" item-value="id" class="text-no-wrap" />
          </VCardText>
        </VCard>

        <!-- 👉 Atividade recente -->
        <VRow>
          <VCol cols="12" md="6">
            <VCard title="Atividades do Sistema">
              <VCardText>
                <ActivityTimeline />
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Notas & Avisos">
              <VCardText>
                <VList class="card-list">
                  <VListItem>
                    <template #prepend>
                      <VAvatar size="34" rounded color="info" variant="tonal">
                        <VIcon icon="tabler-bell" />
                      </VAvatar>
                    </template>
                    <VListItemTitle>Atualização de política de compliance</VListItemTitle>
                    <VListItemSubtitle>Nova revisão pendente</VListItemSubtitle>
                  </VListItem>
                  <VListItem>
                    <template #prepend>
                      <VAvatar size="34" rounded color="warning" variant="tonal">
                        <VIcon icon="tabler-alert-triangle" />
                      </VAvatar>
                    </template>
                    <VListItemTitle>Prazo de assinatura expira em breve</VListItemTitle>
                    <VListItemSubtitle>3 documentos aguardam assinatura</VListItemSubtitle>
                  </VListItem>
                  <VListItem>
                    <template #prepend>
                      <VAvatar size="34" rounded color="success" variant="tonal">
                        <VIcon icon="tabler-check" />
                      </VAvatar>
                    </template>
                    <VListItemTitle>Workflow concluído</VListItemTitle>
                    <VListItemSubtitle>Processo de Onboarding finalizado</VListItemSubtitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Organização -->
      <VWindowItem value="organizacao">
        <VCard title="Organização" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in orgStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <VRow class="match-height">
          <VCol cols="12" md="6">
            <VCard title="Usuários por Departamento">
              <VCardText>
                <VueApexCharts type="bar" height="320" :options="usersByDeptOptions" :series="usersByDeptSeries" />
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Lista de Usuários">
              <VCardText>
                <VRow class="mb-4">
                  <VCol cols="12" md="6">
                    <AppTextField density="compact" label="Buscar" prepend-inner-icon="tabler-search" />
                  </VCol>
                  <VCol cols="12" md="6">
                    <AppSelect density="compact" label="Departamento" :items="usersByDeptCategories" />
                  </VCol>
                </VRow>
                <VDataTable :headers="orgUsersHeaders" :items="orgUsersItems" item-value="email" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Documentos -->
      <VWindowItem value="documentos">
        <VCard title="Documentos" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in docStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VRow class="match-height">
          <VCol cols="12" md="6">
            <VCard title="Documentos por Status">
              <VCardText>
                <VueApexCharts type="donut" height="320" :options="docsByStatusOptions" :series="docsByStatusSeries" />
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Lista de Documentos">
              <VCardText>
                <VRow class="mb-4">
                  <VCol cols="12" md="6">
                    <AppTextField density="compact" label="Buscar" prepend-inner-icon="tabler-search" />
                  </VCol>
                  <VCol cols="12" md="6">
                    <AppSelect density="compact" label="Status" :items="docsByStatusLabels" />
                  </VCol>
                </VRow>
                <VDataTable :headers="docHeaders" :items="docItems" item-value="titulo" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Processos & Workflows -->
      <VWindowItem value="processos">
        <VCard title="Processos & Workflows" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in pwStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VRow class="match-height">
          <VCol cols="12" md="4">
            <VCard title="Instâncias por Status">
              <VCardText>
                <VueApexCharts
type="donut" height="280" :options="instancesByStatusOptions"
                  :series="instancesByStatusSeries"
/>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="4">
            <VCard title="Tarefas por Prioridade">
              <VCardText>
                <VueApexCharts
type="donut" height="280" :options="tasksByPriorityOptions"
                  :series="tasksByPrioritySeries"
/>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="4">
            <VCard title="Workflows por Processo">
              <VCardText>
                <VueApexCharts
type="bar" height="280" :options="workflowsByProcessOptions"
                  :series="workflowsByProcessSeries"
/>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" md="6">
            <VCard title="Lista de Processos">
              <VCardText>
                <VDataTable :headers="processHeaders" :items="processItems" item-value="nome" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Workflows">
              <VCardText>
                <VDataTable :headers="workflowHeaders" :items="workflowItems" item-value="nome" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Formulários -->
      <VWindowItem value="formularios">
        <VCard title="Formulários & Respostas" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in formStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VRow class="match-height">
          <VCol cols="12" md="6">
            <VCard title="Respostas por Formulário">
              <VCardText>
                <VueApexCharts
type="bar" height="320" :options="responsesByFormOptions"
                  :series="responsesByFormSeries"
/>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Formulários Recentes">
              <VCardText>
                <VDataTable :headers="formHeaders" :items="formItems" item-value="form" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Políticas & Regras -->
      <VWindowItem value="regras">
        <VCard title="Políticas & Regras" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in policyStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VRow class="match-height">
          <VCol cols="12" md="6">
            <VCard title="Compliance por Status">
              <VCardText>
                <VueApexCharts
type="donut" height="320" :options="complianceByStatusOptions"
                  :series="complianceByStatusSeries"
/>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Regras de Automação">
              <VCardText>
                <VDataTable :headers="rulesHeaders" :items="rulesItems" item-value="regra" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Comunicação -->
      <VWindowItem value="comunicacao">
        <VCard title="Comunicação" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in commStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VRow>
          <VCol cols="12">
            <VCard title="Notificações Recentes">
              <VCardText>
                <VDataTable :headers="notifHeaders" :items="notifItems" item-value="assunto" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Licenciamento -->
      <VWindowItem value="licenciamento">
        <VCard title="Licenciamento" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in licenseStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VRow>
          <VCol cols="12">
            <VCard title="Licenças & Módulos">
              <VCardText>
                <VDataTable :headers="licenseHeaders" :items="licenseItems" item-value="modulo" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
      <!-- 👉 Sistema -->
      <VWindowItem value="sistema">
        <VCard title="Sistema" class="mb-6">
          <VCardText>
            <VRow>
              <VCol v-for="data in systemStats" :key="data.title" cols="12" md="3" sm="6">
                <VCard>
                  <VCardText class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-body-2 text-medium-emphasis">
{{ data.title }}
</div>
                      <h4 class="text-h4 mt-2">
{{ data.value }}
</h4>
                    </div>
                    <VAvatar rounded :color="data.color" variant="tonal">
                      <VIcon :icon="data.icon" />
                    </VAvatar>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VRow class="match-height">
          <VCol cols="12" md="6">
            <VCard title="Workflow Nodes por Tipo">
              <VCardText>
                <VueApexCharts type="donut" height="320" :options="nodesByTypeOptions" :series="nodesByTypeSeries" />
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12" md="6">
            <VCard title="Menus do Sistema">
              <VCardText>
                <VDataTable :headers="menuHeaders" :items="menuItems" item-value="menu" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VCard title="Workflow Nodes">
              <VCardText>
                <VDataTable :headers="nodeHeaders" :items="nodeItems" item-value="node" class="text-no-wrap" />
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VWindowItem>
    </VWindow>
  </div>
</template>

<style lang="scss">
.card-list {
  --v-card-list-gap: 16px;
}
</style>
