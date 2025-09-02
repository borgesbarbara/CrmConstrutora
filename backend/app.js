require('dotenv').config();

const config = require('./config');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors(config.cors));

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - Body:`, req.body);
  console.log(`📡 Headers:`, req.headers);
  next();
});

if (!config.supabase.url || !config.supabase.serviceKey) {
  process.exit(1);
}

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.log('💥 Erro no servidor:', err);
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.method, req.path);
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

module.exports = app; 