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
  
  // Endpoint de debug
  if (req.path === '/debug') {
    return res.json({
      message: 'API Debug Info',
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      headers: req.headers,
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
