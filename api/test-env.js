const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/test-env', (req, res) => {
  res.json({
    SUPABASE_URL: process.env.SUPABASE_URL || 'NÃO DEFINIDA',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA',
    JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA',
    NODE_ENV: process.env.NODE_ENV || 'NÃO DEFINIDA'
  });
});

module.exports = app; 