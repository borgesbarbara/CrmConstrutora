// Configuração da API
const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://crm-construtora-roan.vercel.app/api' 
        : 'http://localhost:5001/api'),
    version: 'v1',
    timeout: 30000
  },
  
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY
  },
  
  app: {
    name: 'CRM Construtora',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  auth: {
    tokenExpiry: 8 * 60 * 60 * 1000,
    refreshThreshold: 5 * 60 * 1000
  },
  
  upload: {
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFiles: 5
  },
  
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },
  
  features: {
    enableNotifications: true,
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableDebug: process.env.NODE_ENV === 'development'
  }
};

export default config; 