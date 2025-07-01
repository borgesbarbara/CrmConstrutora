-- MIGRAÇÃO 002: Adicionar campo estado nas clínicas
-- Data: 2025-01-01
-- Descrição: Adiciona campo estado com lista de estados brasileiros

BEGIN;

-- Adicionar coluna estado se não existir
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

-- Documentar a mudança
COMMENT ON COLUMN clinicas.estado IS 'Estado brasileiro (sigla de 2 letras: SP, RJ, MG, etc.)';

-- Registrar migração executada
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('002', 'add_estado_field_clinicas', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT; 