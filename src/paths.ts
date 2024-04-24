export const paths = {
  index: '/',
  checkout: '/checkout',
  contact: '/contact',
  pricing: '/pricing',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  register: {
    index: '/register',
    organization: '/register/organization',
  },
  authenticate: '/authenticate',
  onboard: '/onboard',
  auth: {
    auth0: {
      callback: '/auth/auth0/callback',
      login: '/auth/auth0/login',
    },
    jwt: {
      login: '/auth/jwt/login',
      register: '/auth/jwt/register',
    },
    firebase: {
      login: '/auth/firebase/login',
      register: '/auth/firebase/register',
    },
    amplify: {
      confirmRegister: '/auth/amplify/confirm-register',
      forgotPassword: '/auth/amplify/forgot-password',
      login: '/auth/amplify/login',
      register: '/auth/amplify/register',
      resetPassword: '/auth/amplify/reset-password',
    },
  },
  authDemo: {
    forgotPassword: {
      classic: '/auth-demo/forgot-password/classic',
      modern: '/auth-demo/forgot-password/modern',
    },
    login: {
      classic: '/auth-demo/login/classic',
      modern: '/auth-demo/login/modern',
    },
    register: {
      classic: '/auth-demo/register/classic',
      modern: '/auth-demo/register/modern',
      organization: '/auth-demo/register/organization',
      complete: '/auth-demo/register/complete',
    },
    resetPassword: {
      classic: '/auth-demo/reset-password/classic',
      modern: '/auth-demo/reset-password/modern',
    },
    verifyCode: {
      classic: '/auth-demo/verify-code/classic',
      modern: '/auth-demo/verify-code/modern',
    },
  },
  patient: {
    index: '/patient',
    account: '/patient/account',
    consultations: '/patient/consultations',
    files: '/patient/files',
    chat: '/patient/chat',
    invoices: {
      index: '/patient/invoices',
      details: '/patient/invoices/:invoiceId',
    },
  },
  dashboard: {
    index: '/dashboard',
    account: '/dashboard/account',
    gettingStarted: '/dashboard/getting-started',
    analytics: '/dashboard/analytics',
    blank: '/dashboard/blank',
    calendar: '/dashboard/calendar',
    chat: '/dashboard/chat',
    customers: {
      index: '/dashboard/customers',
      details: '/dashboard/customers/:customerId',
      edit: '/dashboard/customers/:customerId/edit',
    },
    ecommerce: '/dashboard/ecommerce',
    fileManager: '/dashboard/file-manager',
    invoices: {
      index: '/dashboard/invoices',
      details: '/dashboard/invoices/:invoiceId',
    },
    jobs: {
      index: '/dashboard/jobs',
      create: '/dashboard/jobs/create',
      companies: {
        details: '/dashboard/jobs/companies/:companyId',
      },
    },
    kanban: '/dashboard/kanban',
    mail: '/dashboard/mail',
    faxing: '/dashboard/faxing',
    consultation: {
      index: '/dashboard/consultations',
      details: '/dashboard/consultations/:id',
    },
    products: {
      index: '/dashboard/products',
      create: '/dashboard/products/create',
    },
    staff:'/dashboard/account/staff/:staffId',
    templates: '/dashboard/templates',
  },
  components: {
    index: '/components',
    dataDisplay: {
      detailLists: '/components/data-display/detail-lists',
      tables: '/components/data-display/tables',
      quickStats: '/components/data-display/quick-stats',
    },
    lists: {
      groupedLists: '/components/lists/grouped-lists',
      gridLists: '/components/lists/grid-lists',
    },
    forms: '/components/forms',
    modals: '/components/modals',
    charts: '/components/charts',
    buttons: '/components/buttons',
    typography: '/components/typography',
    colors: '/components/colors',
    inputs: '/components/inputs',
  },
  docs: 'https://material-kit-pro-react-docs.devias.io',
  notAuthorized: '/errors/401',
  notFound: '/errors/404',
  serverError: '/errors/500',
  schedule: {
    index: '/schedule/:slug',
    service: '/schedule/:slug/service/:serviceSlug',
    id: '/schedule/:slug/:id',
  },
};
