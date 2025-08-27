require('dotenv').config();

const config = require('./config');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors(config.cors));

if (!config.supabase.url || !config.supabase.serviceKey) {
  process.exit(1);
}

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

app.use('/api', routes);

app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

module.exports = app; 