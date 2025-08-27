require('dotenv').config();
const config = require('./config');
const app = require('./app');

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
}); 