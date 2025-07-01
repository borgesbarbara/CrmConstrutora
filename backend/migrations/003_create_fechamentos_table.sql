-- MIGRAÇÃO 003: Criar tabela de fechamentos
-- Data: 2025-01-01
-- Descrição: Cria tabela para registrar vendas/fechamentos realizados

BEGIN;

-- Criar tabela de fechamentos
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

-- Comentários na tabela
COMMENT ON TABLE fechamentos IS 'Registro de vendas/fechamentos realizados';
COMMENT ON COLUMN fechamentos.valor_fechado IS 'Valor total da venda em reais';
COMMENT ON COLUMN fechamentos.data_fechamento IS 'Data em que a venda foi fechada';
COMMENT ON COLUMN fechamentos.forma_pagamento IS 'Como foi pago: À vista, Parcelado, PIX, etc.';

-- Desabilitar RLS para simplificar
ALTER TABLE fechamentos DISABLE ROW LEVEL SECURITY;

-- Registrar migração executada
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('003', 'create_fechamentos_table', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT; 