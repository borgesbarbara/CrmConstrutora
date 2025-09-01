const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

router.post('/cadastro', async (req, res) => {
  try {
    const { nome, telefone, cpf, tipo_servico, observacoes } = req.body;

    if (!nome || !telefone || !cpf) {
      return res.status(400).json({
        error: 'Nome, telefone e CPF são obrigatórios'
      });
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        nome,
        telefone,
        cpf,
        tipo_servico,
        observacoes,
        status: 'lead'
      }])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Lead cadastrado com sucesso! Entraremos em contato em breve.',
      nome: data[0].nome,
      id: data[0].id
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar lead' });
  }
});

module.exports = router;
