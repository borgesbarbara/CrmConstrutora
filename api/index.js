const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Criar app Express otimizado para serverless
const app = express();

// Middlewares básicos
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://crm-construtora-one.vercel.app',
  credentials: true
}));

// Configuração do Supabase com timeout
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Inicializando função serverless:', { 
  hasUrl: !!supabaseUrl, 
  hasKey: !!supabaseServiceKey,
  env: process.env.NODE_ENV 
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis do Supabase não configuradas');
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Login otimizado
app.post('/api/login', async (req, res) => {
  console.log('🔐 Login iniciado:', { 
    email: req.body.email, 
    timestamp: new Date().toISOString() 
  });
  
  try {
    const { email, password, senha } = req.body;
    const finalPassword = password || senha;

    if (!email || !finalPassword) {
      console.log('❌ Dados inválidos');
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

    console.log('✅ Login bem-sucedido:', { 
      userId: data.user?.id, 
      timestamp: new Date().toISOString() 
    });
    
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

// Verify token
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

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('💥 Erro global:', err);
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Exportar como função serverless
module.exports = serverless(app); 