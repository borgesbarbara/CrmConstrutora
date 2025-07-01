-- MIGRAÇÃO 001: Adicionar campos de localização nas clínicas
-- Data: 2025-01-01
-- Descrição: Adiciona campos bairro e cidade para filtros geográficos

BEGIN;

-- Adicionar colunas se não existirem
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS bairro TEXT;

ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS cidade TEXT;

-- Documentar as mudanças
COMMENT ON COLUMN clinicas.bairro IS 'Bairro ou zona da clínica';
COMMENT ON COLUMN clinicas.cidade IS 'Cidade da clínica para filtros geográficos';

-- Registrar migração executada
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('001', 'add_clinicas_location_fields', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT; 