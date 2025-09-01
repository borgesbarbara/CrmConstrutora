const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consultores')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar consultores' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consultores')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar consultor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('consultores')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar consultor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('consultores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Consultor removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover consultor' });
  }
});

module.exports = router;
