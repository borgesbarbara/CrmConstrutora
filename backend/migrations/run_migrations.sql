-- SCRIPT PARA EXECUTAR TODAS AS MIGRAÇÕES
-- Execute este arquivo completo no SQL Editor do Supabase

-- MIGRAÇÃO 000: Criar tabela de controle
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('000', 'create_migrations_table', NOW())
ON CONFLICT (version) DO NOTHING;

-- MIGRAÇÃO 001: Adicionar campos de localização nas clínicas
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS bairro TEXT;

ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS cidade TEXT;

COMMENT ON COLUMN clinicas.bairro IS 'Bairro ou zona da clínica';
COMMENT ON COLUMN clinicas.cidade IS 'Cidade da clínica para filtros geográficos';

INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('001', 'add_clinicas_location_fields', NOW())
ON CONFLICT (version) DO NOTHING;

-- MIGRAÇÃO 002: Adicionar campo estado nas clínicas
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

COMMENT ON COLUMN clinicas.estado IS 'Estado brasileiro (sigla de 2 letras: SP, RJ, MG, etc.)';

INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('002', 'add_estado_field_clinicas', NOW())
ON CONFLICT (version) DO NOTHING;

-- MIGRAÇÃO 003: Criar tabela de fechamentos
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

COMMENT ON TABLE fechamentos IS 'Registro de vendas/fechamentos realizados';
COMMENT ON COLUMN fechamentos.valor_fechado IS 'Valor total da venda em reais';
COMMENT ON COLUMN fechamentos.data_fechamento IS 'Data em que a venda foi fechada';
COMMENT ON COLUMN fechamentos.forma_pagamento IS 'Como foi pago: À vista, Parcelado, PIX, etc.';

ALTER TABLE fechamentos DISABLE ROW LEVEL SECURITY;

INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('003', 'create_fechamentos_table', NOW())
ON CONFLICT (version) DO NOTHING;

-- MIGRAÇÃO 004: Adicionar campo nicho nas clínicas
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS nicho TEXT DEFAULT 'Ambos';

COMMENT ON COLUMN clinicas.nicho IS 'Nicho da clínica: Estético, Odontológico ou Ambos';

INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('004', 'add_nicho_field_clinicas', NOW())
ON CONFLICT (version) DO NOTHING;

-- Verificar migrações executadas
SELECT * FROM schema_migrations ORDER BY version; 