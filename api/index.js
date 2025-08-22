const serverless = require('serverless-http');
const app = require('../backend/app');

// Exportar o app Express como função serverless para Vercel
module.exports = serverless(app); 