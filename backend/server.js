const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key-here';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function para inicializar tabelas no Supabase
const initializeTables = async () => {
  console.log('🔄 Verificando estrutura das tabelas no Supabase...');
  
  // As tabelas serão criadas via SQL no painel do Supabase
  console.log('✅ Para configurar o banco, execute as migrações em backend/migrations/');
  console.log('📁 Use o arquivo: backend/migrations/run_migrations.sql');
  console.log(`
-- Tabela de clínicas (atualizada)
CREATE TABLE IF NOT EXISTS clinicas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  nicho TEXT DEFAULT 'Ambos',
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de consultores
CREATE TABLE IF NOT EXISTS consultores (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pacientes/leads
CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  tipo_tratamento TEXT,
  status TEXT DEFAULT 'lead',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  consultor_id INTEGER REFERENCES consultores(id),
  clinica_id INTEGER REFERENCES clinicas(id),
  data_agendamento DATE,
  horario TIME,
  status TEXT DEFAULT 'agendado',
  lembrado BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de fechamentos
CREATE TABLE IF NOT EXISTS fechamentos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
  consultor_id INTEGER REFERENCES consultores(id) ON DELETE SET NULL,
  clinica_id INTEGER REFERENCES clinicas(id) ON DELETE SET NULL,
  agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  valor_fechado DECIMAL(10,2) NOT NULL,
  data_fechamento DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_tratamento TEXT,
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
  `);
};

// ROTAS DA API

// === CLÍNICAS ===
app.get('/api/clinicas', async (req, res) => {
  try {
    const { cidade, estado } = req.query;
    
    let query = supabase
      .from('clinicas')
      .select('*')
      .order('nome');

    // Filtrar por estado se especificado
    if (estado) {
      query = query.eq('estado', estado);
    }

    // Filtrar por cidade se especificado
    if (cidade) {
      query = query.ilike('cidade', `%${cidade}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clinicas/cidades', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clinicas')
      .select('cidade')
      .not('cidade', 'is', null)
      .not('cidade', 'eq', '');

    if (error) throw error;
    
    // Extrair cidades únicas e ordenar
    const cidadesUnicas = [...new Set(data.map(c => c.cidade))].sort();
    res.json(cidadesUnicas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clinicas/estados', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clinicas')
      .select('estado')
      .not('estado', 'is', null)
      .not('estado', 'eq', '');

    if (error) throw error;
    
    // Extrair estados únicos e ordenar
    const estadosUnicos = [...new Set(data.map(c => c.estado))].sort();
    res.json(estadosUnicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clinicas', async (req, res) => {
  try {
    const { nome, endereco, bairro, cidade, estado, nicho, telefone, email } = req.body;
    
    const { data, error } = await supabase
      .from('clinicas')
      .insert([{ nome, endereco, bairro, cidade, estado, nicho, telefone, email }])
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Clínica cadastrada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clinicas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, bairro, cidade, estado, nicho, telefone, email } = req.body;
    
    const { data, error } = await supabase
      .from('clinicas')
      .update({ nome, endereco, bairro, cidade, estado, nicho, telefone, email })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Clínica atualizada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === CONSULTORES ===
app.get('/api/consultores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('consultores')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultores', async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    
    const { data, error } = await supabase
      .from('consultores')
      .insert([{ nome, telefone }])
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Consultor cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/consultores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone } = req.body;
    
    const { data, error } = await supabase
      .from('consultores')
      .update({ nome, telefone })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Consultor atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === PACIENTES ===
app.get('/api/pacientes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pacientes', async (req, res) => {
  try {
    const { nome, telefone, cpf, tipo_tratamento, status, observacoes } = req.body;
    
    const { data, error } = await supabase
      .from('pacientes')
      .insert([{ nome, telefone, cpf, tipo_tratamento, status: status || 'lead', observacoes }])
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Paciente cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, cpf, tipo_tratamento, status, observacoes } = req.body;
    
    const { data, error } = await supabase
      .from('pacientes')
      .update({ nome, telefone, cpf, tipo_tratamento, status, observacoes })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Paciente atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pacientes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { error } = await supabase
      .from('pacientes')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Status atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === AGENDAMENTOS ===
app.get('/api/agendamentos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        pacientes(nome, telefone),
        consultores(nome),
        clinicas(nome)
      `)
      .order('data_agendamento', { ascending: false })
      .order('horario');

    if (error) throw error;

    // Reformatar dados para compatibilidade com frontend
    const formattedData = data.map(agendamento => ({
      ...agendamento,
      paciente_nome: agendamento.pacientes?.nome,
      paciente_telefone: agendamento.pacientes?.telefone,
      consultor_nome: agendamento.consultores?.nome,
      clinica_nome: agendamento.clinicas?.nome
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const { paciente_id, consultor_id, clinica_id, data_agendamento, horario, observacoes } = req.body;
    
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([{ paciente_id, consultor_id, clinica_id, data_agendamento, horario, observacoes }])
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Agendamento criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { paciente_id, consultor_id, clinica_id, data_agendamento, horario, status, observacoes } = req.body;
    
    const { data, error } = await supabase
      .from('agendamentos')
      .update({ paciente_id, consultor_id, clinica_id, data_agendamento, horario, status, observacoes })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Agendamento atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agendamentos/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { error } = await supabase
      .from('agendamentos')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Status atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/agendamentos/:id/lembrado', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('agendamentos')
      .update({ lembrado: true })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Paciente marcado como lembrado!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === FECHAMENTOS ===
app.get('/api/fechamentos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fechamentos')
      .select(`
        *,
        pacientes(nome, telefone, cpf),
        consultores(nome),
        clinicas(nome)
      `)
      .order('data_fechamento', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Reformatar dados para compatibilidade com frontend
    const formattedData = data.map(fechamento => ({
      ...fechamento,
      paciente_nome: fechamento.pacientes?.nome,
      paciente_telefone: fechamento.pacientes?.telefone,
      paciente_cpf: fechamento.pacientes?.cpf,
      consultor_nome: fechamento.consultores?.nome,
      clinica_nome: fechamento.clinicas?.nome
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fechamentos', async (req, res) => {
  try {
    const { 
      paciente_id, 
      consultor_id, 
      clinica_id, 
      agendamento_id,
      valor_fechado, 
      data_fechamento, 
      tipo_tratamento,
      forma_pagamento,
      observacoes 
    } = req.body;
    
    const { data, error } = await supabase
      .from('fechamentos')
      .insert([{ 
        paciente_id, 
        consultor_id, 
        clinica_id, 
        agendamento_id,
        valor_fechado, 
        data_fechamento, 
        tipo_tratamento,
        forma_pagamento,
        observacoes 
      }])
      .select();

    if (error) throw error;

    // Atualizar status do paciente para "fechado"
    if (paciente_id) {
      await supabase
        .from('pacientes')
        .update({ status: 'fechado' })
        .eq('id', paciente_id);
    }

    // Atualizar status do agendamento para "fechado" se existir
    if (agendamento_id) {
      await supabase
        .from('agendamentos')
        .update({ status: 'fechado' })
        .eq('id', agendamento_id);
    }

    res.json({ id: data[0].id, message: 'Fechamento registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fechamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      paciente_id, 
      consultor_id, 
      clinica_id, 
      agendamento_id,
      valor_fechado, 
      data_fechamento, 
      tipo_tratamento,
      forma_pagamento,
      observacoes 
    } = req.body;
    
    const { data, error } = await supabase
      .from('fechamentos')
      .update({ 
        paciente_id, 
        consultor_id, 
        clinica_id, 
        agendamento_id,
        valor_fechado, 
        data_fechamento, 
        tipo_tratamento,
        forma_pagamento,
        observacoes 
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ id: data[0].id, message: 'Fechamento atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/fechamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('fechamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Fechamento removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === DASHBOARD/ESTATÍSTICAS ===
app.get('/api/dashboard', async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    // Buscar agendamentos de hoje
    const { data: agendamentosHoje, error: error1 } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('data_agendamento', hoje);

    if (error1) throw error1;

    // Buscar lembrados de hoje
    const { data: lembradosHoje, error: error2 } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('data_agendamento', hoje)
      .eq('lembrado', true);

    if (error2) throw error2;

    // Buscar total de pacientes
    const { count: totalPacientes, error: error3 } = await supabase
      .from('pacientes')
      .select('*', { count: 'exact', head: true });

    if (error3) throw error3;

    // Buscar fechamentos
    const { data: fechamentos, error: error5 } = await supabase
      .from('fechamentos')
      .select('*');

    if (error5) throw error5;

    // Estatísticas de fechamentos
    const fechamentosHoje = fechamentos.filter(f => f.data_fechamento === hoje).length;
    
    const fechamentosMes = fechamentos.filter(f => {
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      const dataFechamento = new Date(f.data_fechamento);
      return dataFechamento.getMonth() === mesAtual && dataFechamento.getFullYear() === anoAtual;
    });

    const valorTotalMes = fechamentosMes.reduce((acc, f) => acc + parseFloat(f.valor_fechado || 0), 0);
    const ticketMedio = fechamentosMes.length > 0 ? (valorTotalMes / fechamentosMes.length) : 0;

    // Buscar estatísticas por consultor
    const { data: consultores, error: error4 } = await supabase
      .from('consultores')
      .select(`
        id,
        nome,
        agendamentos(id, lembrado, data_agendamento),
        fechamentos(id, valor_fechado, data_fechamento)
      `);

    if (error4) throw error4;

    // Processar estatísticas dos consultores
    const estatisticasConsultores = consultores.map(consultor => {
      const agendamentos = consultor.agendamentos || [];
      const fechamentosConsultor = consultor.fechamentos || [];
      
      const fechamentosConsultorMes = fechamentosConsultor.filter(f => {
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        const dataFechamento = new Date(f.data_fechamento);
        return dataFechamento.getMonth() === mesAtual && dataFechamento.getFullYear() === anoAtual;
      });

      const valorTotalConsultor = fechamentosConsultorMes.reduce((acc, f) => acc + parseFloat(f.valor_fechado || 0), 0);

      return {
        id: consultor.id,
        nome: consultor.nome,
        total_agendamentos: agendamentos.length,
        total_lembrados: agendamentos.filter(a => a.lembrado).length,
        agendamentos_hoje: agendamentos.filter(a => a.data_agendamento === hoje).length,
        fechamentos_mes: fechamentosConsultorMes.length,
        valor_total_mes: valorTotalConsultor
      };
    });

    res.json({
      agendamentosHoje: agendamentosHoje.length,
      lembradosHoje: lembradosHoje.length,
      totalPacientes,
      fechamentosHoje,
      fechamentosMes: fechamentosMes.length,
      valorTotalMes,
      ticketMedio,
      totalFechamentos: fechamentos.length,
      estatisticasConsultores
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicializar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`🗄️ Usando Supabase como banco de dados`);
  
  // Verificar conexão com Supabase
  try {
    const { data, error } = await supabase.from('clinicas').select('count').limit(1);
    if (error) {
      console.log('⚠️  Configure as variáveis SUPABASE_URL e SUPABASE_KEY no arquivo .env');
      console.log('📖 Consulte o README.md para instruções detalhadas');
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    }
  } catch (error) {
    console.log('⚠️  Erro ao conectar com Supabase:', error.message);
  }
  
  await initializeTables();
}); 