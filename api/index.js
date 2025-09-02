const serverless = require('serverless-http');
const app = require('../backend/app');

const handler = serverless(app);

module.exports = async (req, res) => {
  console.log('🚀 API Handler - Method:', req.method, 'Path:', req.path);
  console.log('🚀 API Handler - Headers:', req.headers);
  
  try {
    return await handler(req, res);
  } catch (error) {
    console.error('💥 API Handler Error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
