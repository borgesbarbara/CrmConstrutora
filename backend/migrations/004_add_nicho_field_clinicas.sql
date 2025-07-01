-- MIGRAÇÃO 004: Adicionar campo nicho nas clínicas
-- Data: 2025-01-01
-- Descrição: Adiciona campo nicho para classificar clínicas como Estético/Odontológico/Ambos

BEGIN;

-- Adicionar campo nicho na tabela clinicas
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS nicho TEXT DEFAULT 'Ambos';

-- Comentário no campo
COMMENT ON COLUMN clinicas.nicho IS 'Nicho da clínica: Estético, Odontológico ou Ambos';

-- Registrar migração executada
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('004', 'add_nicho_field_clinicas', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT; 