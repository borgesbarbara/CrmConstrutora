require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Criar instância do Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Configuração Supabase:', { 
  hasUrl: !!supabaseUrl, 
  hasKey: !!supabaseServiceKey,
  env: process.env.NODE_ENV 
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis do Supabase não configuradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Rota de login
app.post('/api/login', async (req, res) => {
  console.log('🔐 Login iniciado:', { email: req.body.email, timestamp: new Date().toISOString() });
  
  try {
    // Permitir payload com "senha" ou "password"
    const { email, password, senha } = req.body;
    const finalPassword = password || senha;

    if (!email || !finalPassword) {
      console.log('❌ Dados inválidos:', { hasEmail: !!email, hasPassword: !!finalPassword });
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    console.log('📡 Chamando Supabase auth...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: finalPassword
    });

    if (error) {
      console.log('❌ Erro Supabase:', error.message);
      return res.status(401).json({
        error: error.message
      });
    }

    console.log('✅ Login bem-sucedido:', { userId: data.user?.id, timestamp: new Date().toISOString() });
    res.json({
      user: data.user,
      session: data.session
    });

  } catch (error) {
    console.error('💥 Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar token através do Supabase
app.get('/api/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Token ausente' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    return res.json({ ok: true, usuario: { id: data.user.id, email: data.user.email } });
  } catch (err) {
    console.error('Erro no verify-token:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Exportar apenas o app (sem app.listen)
module.exports = app;