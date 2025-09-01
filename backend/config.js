require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 5001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY
  },
  
  auth: {
    tokenExpiry: 8 * 60 * 60 * 1000,
    jwtSecret: process.env.JWT_SECRET || 'default-secret'
  },
  
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || '/api',
    version: 'v1'
  }
};

module.exports = config;
