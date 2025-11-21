<script setup>
import { useTheme } from 'vuetify'
import ActivityTimeline from '@/views/pages/user-profile/profile/ActivityTimeline.vue'
import { getDonutChartConfig, getBarChartConfig } from '@core/libs/apex-chart/apexCharConfig'
import { useApi } from '@/composables/useApi'
import { $api } from '@/utils/api'
import { createUrl } from '@/@core/composable/createUrl'

import { ref, computed, watch, onMounted } from 'vue'
const vuetifyTheme = useTheme()
const activeTab = ref('overview')
const loadedTabs = ref(new Set(['overview']))
const loadingOverview = ref(false)
const loadingOrganizacao = ref(false)
const loadingDocumentos = ref(false)
const loadingProcessos = ref(false)
const loadingFormularios = ref(false)
const loadingPoliticas = ref(false)
const loadingComunicacao = ref(false)
const loadingLicenciamento = ref(false)
const loadingSistema = ref(false)
const errorOverview = ref('')
const errorOrganizacao = ref('')
const errorDocumentos = ref('')
const errorProcessos = ref('')
const errorFormularios = ref('')
const errorPoliticas = ref('')
const errorComunicacao = ref('')
const errorLicenciamento = ref('')
const errorSistema = ref('')

const widgetData = ref([
  { title: 'Usuários', value: 0, icon: 'tabler-users', color: 'primary' },
  { title: 'Empresas', value: 0, icon: 'tabler-building', color: 'info' },
  { title: 'Departamentos', value: 0, icon: 'tabler-stack-2', color: 'warning' },
  { title: 'Documentos', value: 0, icon: 'tabler-file-text', color: 'success' },
  { title: 'Versões de Documento', value: 0, icon: 'tabler-file-diff', color: 'secondary' },
  { title: 'Processos', value: 0, icon: 'tabler-a-b', color: 'primary' },
  { title: 'Workflows', value: 0, icon: 'tabler-flowchart', color: 'info' },
  { title: 'Tarefas', value: 0, icon: 'tabler-list-check', color: 'error' },
])

const tasksByStatusSeries = ref([0, 0, 0, 0])
const tasksByStatusLabels = ['Pendente', 'Em Progresso', 'Concluída', 'Falhou']

const tasksByStatusOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)

  return { ...cfg, labels: tasksByStatusLabels, legend: { position: 'bottom' } }
})

const workflowsByProcessSeries = ref([{ data: [] }])

const workflowsByProcessCategories = ref([])

const workflowsByProcessOptions = computed(() => {
  const cfg = getBarChartConfig(vuetifyTheme.current.value)
  
  return {
    ...cfg,
    xaxis: { ...cfg.xaxis, categories: workflowsByProcessCategories.value },
    plotOptions: { ...cfg.plotOptions, bar: { borderRadius: 6, columnWidth: '40%' } },
    legend: { show: false },
  }
})

// 👉 Organização (Usuários, Roles, Permissões, Empresas, Departamentos)
const orgStats = ref([
  { title: 'Usuários', value: 0, icon: 'tabler-users', color: 'primary' },
  { title: 'Perfis (Roles)', value: 0, icon: 'tabler-shield', color: 'success' },
  { title: 'Permissões', value: 0, icon: 'tabler-key', color: 'secondary' },
  { title: 'Empresas', value: 0, icon: 'tabler-building', color: 'info' },
  { title: 'Departamentos', value: 0, icon: 'tabler-stack-2', color: 'warning' },
])

const usersByDeptSeries = ref([{ data: [] }])
const usersByDeptCategories = ref([])

const usersByDeptOptions = computed(() => {
  const cfg = getBarChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, xaxis: { ...cfg.xaxis, categories: usersByDeptCategories.value }, plotOptions: { ...cfg.plotOptions, bar: { borderRadius: 6 } } }
})

const orgUsersHeaders = [
  { title: 'Nome', key: 'nome' },
  { title: 'Email', key: 'email' },
  { title: 'Departamento', key: 'departamento' },
  { title: 'Perfil', key: 'perfil' },
]

const orgUsersItems = ref([])

// 👉 Documentos (Documentos, Versões, Pastas, Permissões de Pasta, Assinaturas)
const docStats = ref([
  { title: 'Documentos', value: 0, icon: 'tabler-file-text', color: 'success' },
  { title: 'Versões', value: 0, icon: 'tabler-file-diff', color: 'secondary' },
  { title: 'Pastas', value: 0, icon: 'tabler-folders', color: 'info' },
  { title: 'Permissões de Pasta', value: 0, icon: 'tabler-lock', color: 'warning' },
  { title: 'Assinaturas', value: 0, icon: 'tabler-pencil', color: 'primary' },
])

const docsByStatusSeries = ref([0, 0, 0, 0])
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

const docItems = ref([])

// 👉 Processos & Workflows
const pwStats = ref([
  { title: 'Processos', value: 0, icon: 'tabler-a-b', color: 'primary' },
  { title: 'Workflows', value: 0, icon: 'tabler-flowchart', color: 'info' },
  { title: 'Instâncias', value: 0, icon: 'tabler-chart-arcs', color: 'success' },
  { title: 'Tarefas', value: 0, icon: 'tabler-list-check', color: 'error' },
  { title: 'Etapas', value: 0, icon: 'tabler-stairs', color: 'secondary' },
])

const instancesByStatusSeries = ref([0, 0, 0])
const instancesByStatusLabels = ['RUNNING', 'COMPLETED', 'CANCELLED']

const instancesByStatusOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, labels: instancesByStatusLabels, legend: { position: 'bottom' } }
})

const tasksByPrioritySeries = ref([0, 0, 0, 0])
const tasksByPriorityLabels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

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

const processItems = ref([])

const workflowHeaders = [
  { title: 'Nome', key: 'nome' },
  { title: 'Versão', key: 'versao' },
  { title: 'Nós', key: 'nos' },
  { title: 'Variáveis', key: 'variaveis' },
]

const workflowItems = ref([])

// 👉 Formulários
const formStats = ref([
  { title: 'Formulários', value: 0, icon: 'tabler-forms', color: 'primary' },
  { title: 'Respostas', value: 0, icon: 'tabler-list-details', color: 'success' },
])

const responsesByFormSeries = ref([{ data: [] }])
const responsesByFormCategories = ref([])

const responsesByFormOptions = computed(() => {
  const cfg = getBarChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, xaxis: { ...cfg.xaxis, categories: responsesByFormCategories.value }, plotOptions: { ...cfg.plotOptions, bar: { borderRadius: 6 } } }
})

const formHeaders = [
  { title: 'Formulário', key: 'form' },
  { title: 'Respostas', key: 'respostas' },
  { title: 'Última Atualização', key: 'atualizado' },
]

const formItems = ref([])

// 👉 Políticas & Regras (Compliance Policy, Automation Rule)
const policyStats = ref([
  { title: 'Políticas de Compliance', value: 0, icon: 'tabler-scale', color: 'warning' },
  { title: 'Regras de Automação', value: 0, icon: 'tabler-settings', color: 'secondary' },
])

const complianceByStatusSeries = ref([0, 0, 0])
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

const rulesItems = ref([])

// 👉 Comunicação (Notificações & Calendário)
const commStats = ref([
  { title: 'Notificações', value: 0, icon: 'tabler-bell', color: 'info' },
  { title: 'Eventos de Calendário', value: 0, icon: 'tabler-calendar', color: 'primary' },
])

const notifHeaders = [
  { title: 'Assunto', key: 'assunto' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Destinatário', key: 'destinatario' },
  { title: 'Data', key: 'data' },
]

const notifItems = ref([])

// 👉 Licenciamento (Licenças / módulos)
const licenseStats = ref([
  { title: 'Módulos Ativos', value: 0, icon: 'tabler-license', color: 'success' },
  { title: 'Renovações Próximas', value: 0, icon: 'tabler-alert-circle', color: 'warning' },
])

const licenseHeaders = [
  { title: 'Módulo', key: 'modulo' },
  { title: 'Status', key: 'status' },
  { title: 'Expira em', key: 'expira' },
]

const licenseItems = ref([])

// 👉 Sistema (Menus & Workflow Nodes)
const systemStats = ref([
  { title: 'Menus', value: 0, icon: 'tabler-menu-2', color: 'info' },
  { title: 'Workflow Nodes', value: 0, icon: 'tabler-hierarchy-2', color: 'secondary' },
])

const menuHeaders = [
  { title: 'Menu', key: 'menu' },
  { title: 'Caminho', key: 'path' },
  { title: 'Ícone', key: 'icone' },
  { title: 'Ordem', key: 'ordem' },
]

const menuItems = ref([])

const nodesByTypeSeries = ref([0])
const nodesByTypeLabels = ref([])

const nodesByTypeOptions = computed(() => {
  const cfg = getDonutChartConfig(vuetifyTheme.current.value)
  
  return { ...cfg, labels: nodesByTypeLabels.value, legend: { position: 'bottom' } }
})

const nodeHeaders = [
  { title: 'Node', key: 'node' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Workflow', key: 'workflow' },
]

const nodeItems = ref([])

// 👉 Tabela de tarefas recentes (mock)
const taskHeaders = [
  { title: 'ID', key: 'id' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Responsável', key: 'responsavel' },
  { title: 'Estado', key: 'estado' },
  { title: 'Prioridade', key: 'prioridade' },
  { title: 'Prazo', key: 'prazo' },
]

const taskItems = ref([])

// 👉 Ações rápidas (somente UI por enquanto)
const quickActions = [
  { text: 'Novo Documento', icon: 'tabler-file-plus' },
  { text: 'Novo Processo', icon: 'tabler-a-b' },
  { text: 'Novo Workflow', icon: 'tabler-flowchart' },
]

definePage({ meta: { navActiveLink: 'dashboards-iprocess', action: 'manage', subject: 'all' } })

const formatNum = n => {
  try { return new Intl.NumberFormat('pt-PT').format(Number(n || 0)) }
  catch { return String(n ?? 0) }
}

const fetchOverview = async () => {
  try {
    errorOverview.value = ''
    loadingOverview.value = true

    console.debug('[dashboard/overview] request', { url: '/dashboard/overview' })

    const resp = await $api('/dashboard/overview')

    console.debug('[dashboard/overview] response', resp)

    const widgets = resp?.widgets || {}

    widgetData.value = [
      { title: 'Usuários', value: formatNum(widgets.users), icon: 'tabler-users', color: 'primary' },
      { title: 'Empresas', value: formatNum(widgets.empresas), icon: 'tabler-building', color: 'info' },
      { title: 'Departamentos', value: formatNum(widgets.departamentos), icon: 'tabler-stack-2', color: 'warning' },
      { title: 'Documentos', value: formatNum(widgets.documentos), icon: 'tabler-file-text', color: 'success' },
      { title: 'Versões de Documento', value: formatNum(widgets.documentVersions), icon: 'tabler-file-diff', color: 'secondary' },
      { title: 'Processos', value: formatNum(widgets.processos), icon: 'tabler-a-b', color: 'primary' },
      { title: 'Workflows', value: formatNum(widgets.workflows), icon: 'tabler-flowchart', color: 'info' },
      { title: 'Tarefas', value: formatNum(widgets.tarefas), icon: 'tabler-list-check', color: 'error' },
    ]

    const charts = resp?.charts || {}
    const tbs = charts.tasksByStatus || {}

    tasksByStatusSeries.value = [Number(tbs.PENDING || 0), Number(tbs.RUNNING || 0), Number(tbs.COMPLETED || 0), Number(tbs.FAILED || 0)]

    const wbp = charts.workflowsByProcess || []

    workflowsByProcessCategories.value = wbp.map(x => x.label)
    workflowsByProcessSeries.value = [{ data: wbp.map(x => Number(x.value || 0)) }]
    taskItems.value = Array.isArray(resp?.recentTasks) ? resp.recentTasks : []
    console.debug('[dashboard/overview] mapped', {
      widgetData: widgetData.value,
      tasksByStatusSeries: tasksByStatusSeries.value,
      workflowsByProcessCategories: workflowsByProcessCategories.value,
      workflowsByProcessSeries: workflowsByProcessSeries.value,
      taskItemsCount: taskItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/overview] error', err)
    errorOverview.value = err?.data?.message || err?.message || 'Falha ao carregar overview'
  } finally {
    loadingOverview.value = false
  }
}

const fetchOrganizacao = async () => {
  try {
    errorOrganizacao.value = ''
    loadingOrganizacao.value = true
    console.debug('[dashboard/organizacao] request', { url: '/dashboard/organizacao' })

    const resp = await $api('/dashboard/organizacao')

    console.debug('[dashboard/organizacao] response', resp)

    const s = resp?.stats || {}

    orgStats.value = [
      { title: 'Usuários', value: formatNum(s.users), icon: 'tabler-users', color: 'primary' },
      { title: 'Perfis (Roles)', value: formatNum(s.roles), icon: 'tabler-shield', color: 'success' },
      { title: 'Permissões', value: formatNum(s.permissions), icon: 'tabler-key', color: 'secondary' },
      { title: 'Empresas', value: formatNum(s.empresas), icon: 'tabler-building', color: 'info' },
      { title: 'Departamentos', value: formatNum(s.departamentos), icon: 'tabler-stack-2', color: 'warning' },
    ]

    const ubd = Array.isArray(resp?.usersByDept) ? resp.usersByDept : []

    usersByDeptCategories.value = ubd.map(x => x.label)
    usersByDeptSeries.value = [{ data: ubd.map(x => Number(x.value || 0)) }]
    orgUsersItems.value = Array.isArray(resp?.users) ? resp.users : []
    console.debug('[dashboard/organizacao] mapped', {
      orgStats: orgStats.value,
      usersByDeptCategories: usersByDeptCategories.value,
      usersByDeptSeries: usersByDeptSeries.value,
      orgUsersCount: orgUsersItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/organizacao] error', err)
    errorOrganizacao.value = err?.data?.message || err?.message || 'Falha ao carregar organização'
  } finally {
    loadingOrganizacao.value = false
  }
}

const fetchDocumentos = async () => {
  try {
    errorDocumentos.value = ''
    loadingDocumentos.value = true
    console.debug('[dashboard/documentos] request', { url: '/dashboard/documentos' })

    const resp = await $api('/dashboard/documentos')

    console.debug('[dashboard/documentos] response', resp)

    const s = resp?.stats || {}

    docStats.value = [
      { title: 'Documentos', value: formatNum(s.documentos), icon: 'tabler-file-text', color: 'success' },
      { title: 'Versões', value: formatNum(s.versoes), icon: 'tabler-file-diff', color: 'secondary' },
      { title: 'Pastas', value: formatNum(s.pastas), icon: 'tabler-folders', color: 'info' },
      { title: 'Permissões de Pasta', value: formatNum(s.permissoesPastas), icon: 'tabler-lock', color: 'warning' },
      { title: 'Assinaturas', value: formatNum(s.assinaturas), icon: 'tabler-pencil', color: 'primary' },
    ]

    const ds = resp?.docsByStatus || {}

    docsByStatusSeries.value = [Number(ds.publicado || 0), Number(ds.revisao || 0), Number(ds.rascunho || 0), Number(ds.arquivado || 0)]
    docItems.value = Array.isArray(resp?.documentos) ? resp.documentos : []
    console.debug('[dashboard/documentos] mapped', {
      docStats: docStats.value,
      docsByStatusSeries: docsByStatusSeries.value,
      docItemsCount: docItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/documentos] error', err)
    errorDocumentos.value = err?.data?.message || err?.message || 'Falha ao carregar documentos'
  } finally {
    loadingDocumentos.value = false
  }
}

const fetchProcessos = async () => {
  try {
    errorProcessos.value = ''
    loadingProcessos.value = true
    console.debug('[dashboard/processos] request', { url: '/dashboard/processos' })

    const resp = await $api('/dashboard/processos')

    console.debug('[dashboard/processos] response', resp)

    const s = resp?.stats || {}

    pwStats.value = [
      { title: 'Processos', value: formatNum(s.processos), icon: 'tabler-a-b', color: 'primary' },
      { title: 'Workflows', value: formatNum(s.workflows), icon: 'tabler-flowchart', color: 'info' },
      { title: 'Instâncias', value: formatNum(s.instancias), icon: 'tabler-chart-arcs', color: 'success' },
      { title: 'Tarefas', value: formatNum(s.tarefas), icon: 'tabler-list-check', color: 'error' },
      { title: 'Etapas', value: formatNum(s.etapas), icon: 'tabler-stairs', color: 'secondary' },
    ]

    const ibs = resp?.instancesByStatus || {}

    instancesByStatusSeries.value = [Number(ibs.RUNNING || 0), Number(ibs.COMPLETED || 0), Number(ibs.CANCELLED || 0)]

    const tbp = resp?.tasksByPriority || {}

    tasksByPrioritySeries.value = [Number(tbp.LOW || 0), Number(tbp.MEDIUM || 0), Number(tbp.HIGH || 0), Number(tbp.CRITICAL || 0)]

    const wbp = Array.isArray(resp?.workflowsByProcess) ? resp.workflowsByProcess : []

    workflowsByProcessCategories.value = wbp.map(x => x.label)
    workflowsByProcessSeries.value = [{ data: wbp.map(x => Number(x.value || 0)) }]
    processItems.value = Array.isArray(resp?.processos) ? resp.processos : []
    workflowItems.value = Array.isArray(resp?.workflows) ? resp.workflows : []
    console.debug('[dashboard/processos] mapped', {
      pwStats: pwStats.value,
      instancesByStatusSeries: instancesByStatusSeries.value,
      tasksByPrioritySeries: tasksByPrioritySeries.value,
      workflowsByProcessCategories: workflowsByProcessCategories.value,
      workflowsByProcessSeries: workflowsByProcessSeries.value,
      processosCount: processItems.value.length,
      workflowsCount: workflowItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/processos] error', err)
    errorProcessos.value = err?.data?.message || err?.message || 'Falha ao carregar processos'
  } finally {
    loadingProcessos.value = false
  }
}

const fetchFormularios = async () => {
  try {
    errorFormularios.value = ''
    loadingFormularios.value = true
    console.debug('[dashboard/formularios] request', { url: '/dashboard/formularios' })

    const resp = await $api('/dashboard/formularios')

    console.debug('[dashboard/formularios] response', resp)

    const s = resp?.stats || {}

    formStats.value = [
      { title: 'Formulários', value: formatNum(s.formularios), icon: 'tabler-forms', color: 'primary' },
      { title: 'Respostas', value: formatNum(s.respostas), icon: 'tabler-list-details', color: 'success' },
    ]

    const rbf = Array.isArray(resp?.responsesByForm) ? resp.responsesByForm : []

    responsesByFormCategories.value = rbf.map(x => x.label)
    responsesByFormSeries.value = [{ data: rbf.map(x => Number(x.value || 0)) }]
    formItems.value = Array.isArray(resp?.formularios) ? resp.formularios : []
    console.debug('[dashboard/formularios] mapped', {
      formStats: formStats.value,
      responsesByFormCategories: responsesByFormCategories.value,
      responsesByFormSeries: responsesByFormSeries.value,
      formItemsCount: formItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/formularios] error', err)
    errorFormularios.value = err?.data?.message || err?.message || 'Falha ao carregar formulários'
  } finally {
    loadingFormularios.value = false
  }
}

const fetchPoliticas = async () => {
  try {
    errorPoliticas.value = ''
    loadingPoliticas.value = true
    console.debug('[dashboard/politicas] request', { url: '/dashboard/politicas' })

    const resp = await $api('/dashboard/politicas')

    console.debug('[dashboard/politicas] response', resp)

    const s = resp?.stats || {}

    policyStats.value = [
      { title: 'Políticas de Compliance', value: formatNum(s.policies), icon: 'tabler-scale', color: 'warning' },
      { title: 'Regras de Automação', value: formatNum(s.rules), icon: 'tabler-settings', color: 'secondary' },
    ]

    const cbs = resp?.complianceByStatus || {}

    complianceByStatusSeries.value = [Number(cbs.VIGENTE || 0), Number(cbs.REVISAO || 0), Number(cbs.ARQUIVADA || 0)]
    rulesItems.value = Array.isArray(resp?.rules) ? resp.rules : []
    console.debug('[dashboard/politicas] mapped', {
      policyStats: policyStats.value,
      complianceByStatusSeries: complianceByStatusSeries.value,
      rulesCount: rulesItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/politicas] error', err)
    errorPoliticas.value = err?.data?.message || err?.message || 'Falha ao carregar políticas'
  } finally {
    loadingPoliticas.value = false
  }
}

const fetchComunicacao = async () => {
  try {
    errorComunicacao.value = ''
    loadingComunicacao.value = true
    console.debug('[dashboard/comunicacao] request', { url: '/dashboard/comunicacao' })

    const resp = await $api('/dashboard/comunicacao')

    console.debug('[dashboard/comunicacao] response', resp)

    const s = resp?.stats || {}

    commStats.value = [
      { title: 'Notificações', value: formatNum(s.notificacoes), icon: 'tabler-bell', color: 'info' },
      { title: 'Eventos de Calendário', value: formatNum(s.eventosCalendario), icon: 'tabler-calendar', color: 'primary' },
    ]
    notifItems.value = Array.isArray(resp?.notificacoes) ? resp.notificacoes : []
    console.debug('[dashboard/comunicacao] mapped', {
      commStats: commStats.value,
      notifItemsCount: notifItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/comunicacao] error', err)
    errorComunicacao.value = err?.data?.message || err?.message || 'Falha ao carregar comunicação'
  } finally {
    loadingComunicacao.value = false
  }
}

const fetchLicenciamento = async () => {
  try {
    errorLicenciamento.value = ''
    loadingLicenciamento.value = true
    console.debug('[dashboard/licenciamento] request', { url: '/dashboard/licenciamento' })

    const resp = await $api('/dashboard/licenciamento')

    console.debug('[dashboard/licenciamento] response', resp)

    const s = resp?.stats || {}

    licenseStats.value = [
      { title: 'Módulos Ativos', value: formatNum(s.modulosAtivos), icon: 'tabler-license', color: 'success' },
      { title: 'Renovações Próximas', value: formatNum(s.renovacoesProximas), icon: 'tabler-alert-circle', color: 'warning' },
    ]
    licenseItems.value = Array.isArray(resp?.licenses) ? resp.licenses : []
    console.debug('[dashboard/licenciamento] mapped', {
      licenseStats: licenseStats.value,
      licenseItemsCount: licenseItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/licenciamento] error', err)
    errorLicenciamento.value = err?.data?.message || err?.message || 'Falha ao carregar licenciamento'
  } finally {
    loadingLicenciamento.value = false
  }
}

const fetchSistema = async () => {
  try {
    errorSistema.value = ''
    loadingSistema.value = true
    console.debug('[dashboard/sistema] request', { url: '/dashboard/sistema' })

    const resp = await $api('/dashboard/sistema')

    console.debug('[dashboard/sistema] response', resp)

    const s = resp?.stats || {}

    systemStats.value = [
      { title: 'Menus', value: formatNum(s.menus), icon: 'tabler-menu-2', color: 'info' },
      { title: 'Workflow Nodes', value: formatNum(s.workflowNodes), icon: 'tabler-hierarchy-2', color: 'secondary' },
    ]

    const nbt = Array.isArray(resp?.nodesByType) ? resp.nodesByType : []

    nodesByTypeLabels.value = nbt.map(x => x.label)
    nodesByTypeSeries.value = nbt.map(x => Number(x.value || 0))
    menuItems.value = Array.isArray(resp?.menus) ? resp.menus : []
    nodeItems.value = Array.isArray(resp?.nodes) ? resp.nodes : []
    console.debug('[dashboard/sistema] mapped', {
      systemStats: systemStats.value,
      nodesByTypeLabels: nodesByTypeLabels.value,
      nodesByTypeSeries: nodesByTypeSeries.value,
      menuItemsCount: menuItems.value.length,
      nodeItemsCount: nodeItems.value.length,
    })
  } catch (err) {
    console.error('[dashboard/sistema] error', err)
    errorSistema.value = err?.data?.message || err?.message || 'Falha ao carregar sistema'
  } finally {
    loadingSistema.value = false
  }
}

const ensureTabData = async tab => {
  if (loadedTabs.value.has(tab)) return
  loadedTabs.value.add(tab)
  if (tab === 'organizacao') await fetchOrganizacao()
  else if (tab === 'documentos') await fetchDocumentos()
  else if (tab === 'processos') await fetchProcessos()
  else if (tab === 'formularios') await fetchFormularios()
  else if (tab === 'regras') await fetchPoliticas()
  else if (tab === 'comunicacao') await fetchComunicacao()
  else if (tab === 'licenciamento') await fetchLicenciamento()
  else if (tab === 'sistema') await fetchSistema()
}

watch(activeTab, async val => {
  console.debug('[dashboard] tab change', val)
  await ensureTabData(val)
})

onMounted(async () => {
  console.debug('[dashboard] mounted, fetching overview')
  await fetchOverview()
})
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
            <VAlert v-if="errorOverview" type="error" class="mt-4" variant="tonal">{{ errorOverview }}</VAlert>
            <div v-if="loadingOverview" class="d-flex justify-center mt-4"><VProgressCircular indeterminate color="primary" /></div>
          </VCardText>
        </VCard>

        <!-- 👉 Widgets de estatísticas -->
        <VCard class="mb-6" v-if="!loadingOverview">
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
        <VRow v-if="!loadingOverview" class="match-height mb-6">
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
        <VCard v-if="!loadingOverview" title="Tarefas recentes" class="mb-6">
          <VCardText>
            <VDataTable :headers="taskHeaders" :items="taskItems" item-value="id" class="text-no-wrap" />
          </VCardText>
        </VCard>

        <!-- 👉 Atividade recente -->
        <VRow v-if="!loadingOverview">
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
        <VAlert v-if="errorOrganizacao" type="error" class="mb-4" variant="tonal">{{ errorOrganizacao }}</VAlert>
        <div v-if="loadingOrganizacao" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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

        <VRow v-if="!loadingOrganizacao" class="match-height">
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
        <VAlert v-if="errorDocumentos" type="error" class="mb-4" variant="tonal">{{ errorDocumentos }}</VAlert>
        <div v-if="loadingDocumentos" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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
        <VRow v-if="!loadingDocumentos" class="match-height">
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
        <VAlert v-if="errorProcessos" type="error" class="mb-4" variant="tonal">{{ errorProcessos }}</VAlert>
        <div v-if="loadingProcessos" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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
        <VRow v-if="!loadingProcessos" class="match-height">
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
        <VRow v-if="!loadingProcessos">
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
        <VAlert v-if="errorFormularios" type="error" class="mb-4" variant="tonal">{{ errorFormularios }}</VAlert>
        <div v-if="loadingFormularios" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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
        <VRow v-if="!loadingFormularios" class="match-height">
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
        <VAlert v-if="errorPoliticas" type="error" class="mb-4" variant="tonal">{{ errorPoliticas }}</VAlert>
        <div v-if="loadingPoliticas" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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
        <VRow v-if="!loadingPoliticas" class="match-height">
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
        <VAlert v-if="errorComunicacao" type="error" class="mb-4" variant="tonal">{{ errorComunicacao }}</VAlert>
        <div v-if="loadingComunicacao" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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
        <VRow v-if="!loadingComunicacao">
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
        <VAlert v-if="errorLicenciamento" type="error" class="mb-4" variant="tonal">{{ errorLicenciamento }}</VAlert>
        <div v-if="loadingLicenciamento" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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
        <VRow v-if="!loadingLicenciamento">
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
        <VAlert v-if="errorSistema" type="error" class="mb-4" variant="tonal">{{ errorSistema }}</VAlert>
        <div v-if="loadingSistema" class="d-flex justify-center my-4"><VProgressCircular indeterminate color="primary" /></div>
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
        <VRow v-if="!loadingSistema" class="match-height">
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
