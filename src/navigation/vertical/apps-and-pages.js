export default [
  { heading: 'Apps & Pages' },
  {
    title: 'Ecommerce',
    icon: { icon: 'tabler-shopping-cart' },
    children: [
      {
        title: 'Dashboard',
        to: 'apps-ecommerce-dashboard',
      },
      {
        title: 'Product',
        children: [
          { title: 'List', to: 'apps-ecommerce-product-list' },
          { title: 'Add', to: 'apps-ecommerce-product-add' },
          { title: 'Category', to: 'apps-ecommerce-product-category-list' },
        ],
      },
      {
        title: 'Order',
        children: [
          { title: 'List', to: 'apps-ecommerce-order-list' },
          { title: 'Details', to: { name: 'apps-ecommerce-order-details-id', params: { id: '9042' } } },
        ],
      },
      {
        title: 'Customer',
        children: [
          { title: 'List', to: 'apps-ecommerce-customer-list' },
          { title: 'Details', to: { name: 'apps-ecommerce-customer-details-id', params: { id: 478426 } } },
        ],
      },
      {
        title: 'Manage Review',
        to: 'apps-ecommerce-manage-review',
      },
      {
        title: 'Referrals',
        to: 'apps-ecommerce-referrals',
      },
      {
        title: 'Settings',
        to: 'apps-ecommerce-settings',
      },
    ],
  },
  {
    title: 'Academy',
    icon: { icon: 'tabler-school' },
    children: [
      { title: 'Dashboard', to: 'apps-academy-dashboard' },
      { title: 'My Course', to: 'apps-academy-my-course' },
      { title: 'Course Details', to: 'apps-academy-course-details' },
    ],
  },
  {
    title: 'Logistics',
    icon: { icon: 'tabler-truck' },
    children: [
      { title: 'Dashboard', to: 'apps-logistics-dashboard' },
      { title: 'Fleet', to: 'apps-logistics-fleet' },
    ],
  },
  {
    title: 'Email',
    icon: { icon: 'tabler-mail' },
    to: 'apps-email',
  },
  {
    title: 'Chat',
    icon: { icon: 'tabler-message-circle-2' },
    to: 'apps-chat',
  },
  {
    title: 'Calendar',
    icon: { icon: 'tabler-calendar' },
    to: 'apps-calendar',
  },
  {
    title: 'Kanban',
    icon: { icon: 'tabler-layout-kanban' },
    to: 'apps-kanban',
  },
  {
    title: 'Invoice',
    icon: { icon: 'tabler-file-invoice' },
    children: [
      { title: 'List', to: 'apps-invoice-list' },
      { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } } },
      { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } } },
      { title: 'Add', to: 'apps-invoice-add' },
    ],
  },
  {
    title: 'User',
    icon: { icon: 'tabler-user' },
    children: [
      { title: 'List', to: 'apps-user-list' },
      { title: 'View', to: { name: 'apps-user-view-id', params: { id: 21 } } },
    ],
  },
  {
    title: 'Empresas',
    icon: { icon: 'tabler-building' },
    children: [
      { title: 'Listar', to: 'empresa-listar' },
      { title: 'Adicionar', to: 'empresa-adicionar' },
      { title: 'Documentos', to: 'documento-empresa-listar' },
    ],
  },
  {
    title: 'Departamentos',
    icon: { icon: 'tabler-building' },
    children: [
      { title: 'Listar', to: 'departamento-listar' },
      { title: 'Adicionar', to: 'departamento-adicionar' },
    ],
  },
  {
    title: 'Usuários',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'Listar', to: 'user-listar' },
      { title: 'Adicionar', to: 'user-adicionar' },
    ],
  },
  {
    title: 'Planos',
    icon: { icon: 'tabler-currency-dollar' },
    children: [
      { title: 'Listar', to: 'plan-listar' },
      { title: 'Adicionar', to: 'plan-adicionar' },
    ],
  },
  {
    title: 'Documentos',
    icon: { icon: 'tabler-file' },
    children: [
      { title: 'Listar', to: 'document-listar' },
      { title: 'Adicionar', to: 'document-adicionar' },
    ],
  },
  {
    title: 'Pasta',
    icon: { icon: 'tabler-folder' },
    children: [
      { title: 'Listar', to: 'folder-listar' },
      { title: 'Adicionar', to: 'folder-adicionar' },
    ],
  },
  {
    title: 'Roles & Permissions',
    icon: { icon: 'tabler-lock' },
    children: [
      { title: 'Roles', to: 'apps-roles' },
      { title: 'Permissions', to: 'apps-permissions' },
    ],
  },
  {
    title: 'Pages',
    icon: { icon: 'tabler-file' },
    children: [
      { title: 'User Profile', to: { name: 'pages-user-profile-tab', params: { tab: 'profile' } } },
      { title: 'Account Settings', to: { name: 'pages-account-settings-tab', params: { tab: 'account' } } },
      { title: 'Pricing', to: 'pages-pricing' },
      { title: 'FAQ', to: 'pages-faq' },
      {
        title: 'Miscellaneous',
        children: [
          { title: 'Coming Soon', to: 'pages-misc-coming-soon', target: '_blank' },
          { title: 'Under Maintenance', to: 'pages-misc-under-maintenance', target: '_blank' },
          { title: 'Page Not Found - 404', to: { path: '/pages/misc/not-found' }, target: '_blank' },
          { title: 'Not Authorized - 401', to: { path: '/pages/misc/not-authorized' }, target: '_blank' },
        ],
      },
    ],
  },
  {
    title: 'Authentication',
    icon: { icon: 'tabler-shield-lock' },
    children: [
      {
        title: 'Login',
        children: [
          { title: 'Login v1', to: 'pages-authentication-login-v1', target: '_blank' },
          { title: 'Login v2', to: 'pages-authentication-login-v2', target: '_blank' },
        ],
      },
      {
        title: 'Register',
        children: [
          { title: 'Register v1', to: 'pages-authentication-register-v1', target: '_blank' },
          { title: 'Register v2', to: 'pages-authentication-register-v2', target: '_blank' },
          { title: 'Register Multi-Steps', to: 'pages-authentication-register-multi-steps', target: '_blank' },
        ],
      },
      {
        title: 'Verify Email',
        children: [
          { title: 'Verify Email v1', to: 'pages-authentication-verify-email-v1', target: '_blank' },
          { title: 'Verify Email v2', to: 'pages-authentication-verify-email-v2', target: '_blank' },
        ],
      },
      {
        title: 'Forgot Password',
        children: [
          { title: 'Forgot Password v1', to: 'pages-authentication-forgot-password-v1', target: '_blank' },
          { title: 'Forgot Password v2', to: 'pages-authentication-forgot-password-v2', target: '_blank' },
        ],
      },
      {
        title: 'Reset Password',
        children: [
          { title: 'Reset Password v1', to: 'pages-authentication-reset-password-v1', target: '_blank' },
          { title: 'Reset Password v2', to: 'pages-authentication-reset-password-v2', target: '_blank' },
        ],
      },
      {
        title: 'Two Steps',
        children: [
          { title: 'Two Steps v1', to: 'pages-authentication-two-steps-v1', target: '_blank' },
          { title: 'Two Steps v2', to: 'pages-authentication-two-steps-v2', target: '_blank' },
        ],
      },
    ],
  },
  {
    title: 'Wizard Examples',
    icon: { icon: 'tabler-dots' },
    children: [
      { title: 'Checkout', to: { name: 'wizard-examples-checkout' } },
      { title: 'Property Listing', to: { name: 'wizard-examples-property-listing' } },
      { title: 'Create Deal', to: { name: 'wizard-examples-create-deal' } },
    ],
  },
  {
    title: 'Dialog Examples',
    icon: { icon: 'tabler-square' },
    to: 'pages-dialog-examples',
  },
  
  { heading: 'Módulos iProcess' },
  {
    title: 'Formulários',
    icon: { icon: 'tabler-forms' },
    children: [
      { title: 'Listar', to: 'form-listar' },
      { title: 'Adicionar', to: 'form-adicionar' },
    ],
  },
  {
    title: 'Respostas',
    icon: { icon: 'tabler-list-details' },
    children: [
      { title: 'Listar', to: 'form-response-listar' },
    ],
  },
  {
    title: 'Licenças',
    icon: { icon: 'tabler-badge' },
    children: [
      { title: 'Listar', to: 'license-listar' },
    ],
  },
  {
    title: 'Logs',
    icon: { icon: 'tabler-list' },
    children: [
      { title: 'Listar', to: 'log-entry-listar' },
    ],
  },
  {
    title: 'Notificações',
    icon: { icon: 'tabler-bell' },
    children: [
      { title: 'Listar', to: 'notification-listar' },
    ],
  },
  {
    title: 'Processos',
    icon: { icon: 'tabler-flow' },
    children: [
      { title: 'Listar', to: 'process-listar' },
    ],
  },
  {
    title: 'Autores de Processo',
    icon: { icon: 'tabler-user-cog' },
    children: [
      { title: 'Listar', to: 'process-author-listar' },
    ],
  },
  {
    title: 'Modelos de Papel',
    icon: { icon: 'tabler-user-shield' },
    children: [
      { title: 'Listar', to: 'role-model-listar' },
    ],
  },
  {
    title: 'Permissões de Papel',
    icon: { icon: 'tabler-key' },
    children: [
      { title: 'Listar', to: 'role-permission-listar' },
    ],
  },
  {
    title: 'Assinaturas',
    icon: { icon: 'tabler-signature' },
    children: [
      { title: 'Listar', to: 'signature-listar' },
    ],
  },
  {
    title: 'Tarefas',
    icon: { icon: 'tabler-checkbox' },
    children: [
      { title: 'Listar', to: 'task-listar' },
    ],
  },
  {
    title: 'Workflows',
    icon: { icon: 'tabler-topology-star-3' },
    children: [
      { title: 'Listar', to: 'workflow-listar' },
    ],
  },
]
