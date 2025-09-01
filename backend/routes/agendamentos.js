const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabase.url, config.supabase.serviceKey);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        clientes(nome, telefone),
        consultores(nome),
        imobiliarias(nome)
      `)
      .order('data_agendamento', { ascending: true });

    if (error) throw error;
    
    const agendamentosComNomes = data?.map(ag => ({
      ...ag,
      cliente_nome: ag.clientes?.nome,
      consultor_nome: ag.consultores?.nome,
      imobiliaria_nome: ag.imobiliarias?.nome
    })) || [];

    res.json(agendamentosComNomes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar agendamentos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([req.body])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('agendamentos')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Agendamento removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover agendamento' });
  }
});

module.exports = router;
