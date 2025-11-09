const emailRouteComponent = () => import('@/pages/apps/email/index.vue')

// 👉 Redirects
export const redirects = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      const userData = useCookie('userData')
      const userRole = userData.value?.role
      if (userRole === 'SUPER_ADMIN')
        return { name: 'dashboards-iprocess' }
      if (userRole)

        // return { name: 'not-authorized' }
        return { name: 'login', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]
export const routes = [
  // Email filter
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  // Email label
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      // contentClass: 'email-application',
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },
  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('@/pages/apps/logistics/dashboard.vue'),
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('@/pages/apps/academy/dashboard.vue'),
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },

  // --- Custom routes for Departamentos & Usuários CRUD ---
  // Departamentos
  {
    path: '/departamento/listar',
    name: 'departamento-listar',
    component: () => import('@/pages/departamento/listar.vue'),
  },
  {
    path: '/departamento/adicionar',
    name: 'departamento-adicionar',
    component: () => import('@/pages/departamento/adicionar.vue'),
  },
  {
    path: '/departamento/:id',
    name: 'departamento-id',
    component: () => import('@/pages/departamento/[id].vue'),
  },

  // Usuários
  {
    path: '/user/listar',
    name: 'user-listar',
    component: () => import('@/pages/user/listar.vue'),
  },
  {
    path: '/user/adicionar',
    name: 'user-adicionar',
    component: () => import('@/pages/user/adicionar.vue'),
  },
  {
    path: '/user/:id',
    name: 'user-id',
    component: () => import('@/pages/user/[id].vue'),
  },

  // Planos
  {
    path: '/plan/listar',
    name: 'plan-listar',
    component: () => import('@/pages/plan/listar.vue'),
  },
  {
    path: '/plan/adicionar',
    name: 'plan-adicionar',
    component: () => import('@/pages/plan/adicionar.vue'),
  },
  {
    path: '/plan/:id',
    name: 'plan-id',
    component: () => import('@/pages/plan/[id].vue'),
  },

  // Documentos
  {
    path: '/document/listar',
    name: 'document-listar',
    component: () => import('@/pages/document/listar.vue'),
  },
  {
    path: '/document/adicionar',
    name: 'document-adicionar',
    component: () => import('@/pages/document/adicionar.vue'),
  },
  {
    path: '/document/:id',
    name: 'document-id',
    component: () => import('@/pages/document/[id].vue'),
  },
]
