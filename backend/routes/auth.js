const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ message: 'Auth endpoint working', timestamp: new Date().toISOString() });
});

router.post('/login', async (req, res) => {
  try {
    console.log('📥 Dados recebidos no login:', req.body);
    console.log('📋 Headers:', req.headers);
    
    const { email, password, senha } = req.body;
    
    const userPassword = password || senha;

    if (!email || !userPassword) {
      console.log('❌ Dados faltando:', { email: !!email, password: !!userPassword });
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    console.log('✅ Dados válidos, tentando autenticar...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: userPassword
    });

    if (error) {
      console.log('❌ Erro na autenticação:', error);
      return res.status(401).json({
        error: error.message
      });
    }

    console.log('✅ Login bem-sucedido para:', email);
    
    const usuario = {
      id: data.user.id,
      nome: data.user.user_metadata?.nome || data.user.email,
      email: data.user.email,
      tipo: data.user.user_metadata?.tipo || 'user',
      consultor_id: data.user.user_metadata?.consultor_id || null
    };

    res.json({
      token: data.session.access_token,
      usuario,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.log('💥 Erro interno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const usuario = {
      id: user.id,
      nome: user.user_metadata?.nome || user.email,
      email: user.email,
      tipo: user.user_metadata?.tipo || 'user',
      consultor_id: user.user_metadata?.consultor_id || null
    };

    res.json({ usuario });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
