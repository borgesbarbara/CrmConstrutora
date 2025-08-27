const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const config = require('../config');
    
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: error.message
      });
    }

    res.json({
      user: data.user,
      session: data.session
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
