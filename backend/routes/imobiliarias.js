const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('imobiliarias')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar imobiliárias' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('imobiliarias')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar imobiliária' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('imobiliarias')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar imobiliária' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('imobiliarias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Imobiliária removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover imobiliária' });
  }
});

module.exports = router;
