const serverless = require('serverless-http');
const path = require('path');

// Garantir que o caminho está correto
const appPath = path.join(__dirname, '../backend/app');
console.log('🔍 Tentando carregar app de:', appPath);

const app = require(appPath);

const handler = serverless(app);

module.exports = async (req, res) => {
  console.log('🚀 API Handler - Method:', req.method, 'Path:', req.path);
  console.log('🚀 API Handler - Headers:', req.headers);
  
  // Configurar CORS headers
  const allowedOrigins = [
    'http://localhost:3000',
    'https://crm-construtora-roan.vercel.app',
    'https://crm-construtora-roan.vercel.app/',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Lidar com preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Endpoint de debug
  if (req.path === '/debug') {
    return res.json({
      message: 'API Debug Info',
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      headers: req.headers,
      origin: origin,
      allowedOrigins: allowedOrigins,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY
      }
    });
  }
  
  try {
    return await handler(req, res);
  } catch (error) {
    console.error('💥 API Handler Error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};