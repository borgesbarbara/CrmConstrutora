const express = require('express');
const cors = require('cors');

const app = express();

// Configuração CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://crm-construtora-roan.vercel.app',
    'https://crm-construtora.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Rota de teste simples
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    routes: [
      '/login',
      '/logout', 
      '/verify-token',
      '/consultores/cadastro',
      '/leads/cadastro',
      '/pacientes',
      '/agendamentos',
      '/fechamentos',
      '/dashboard'
    ]
  });
});

// Rota para testar variáveis de ambiente
app.get('/env-test', (req, res) => {
  res.json({
    SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✅ Definida' : '❌ Não definida',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Definida' : '❌ Não definida',
    NODE_ENV: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📋 Rotas disponíveis:`);
  console.log(`   - GET  /test`);
  console.log(`   - GET  /env-test`);
  console.log(`\n🔗 Teste acessando:`);
  console.log(`   http://localhost:${PORT}/test`);
  console.log(`   http://localhost:${PORT}/env-test`);
}); 