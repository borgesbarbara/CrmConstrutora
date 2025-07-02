-- Migração 006: Adicionar campo de contrato na tabela fechamentos
-- Execute este comando no SQL Editor do Supabase

-- Adicionar campo para armazenar o arquivo do contrato
ALTER TABLE fechamentos ADD COLUMN IF NOT EXISTS contrato_arquivo TEXT;
ALTER TABLE fechamentos ADD COLUMN IF NOT EXISTS contrato_nome_original TEXT;
ALTER TABLE fechamentos ADD COLUMN IF NOT EXISTS contrato_tamanho INTEGER;
ALTER TABLE fechamentos ADD COLUMN IF NOT EXISTS contrato_upload_data TIMESTAMP DEFAULT NOW();

-- Comentários para documentação
COMMENT ON COLUMN fechamentos.contrato_arquivo IS 'Nome do arquivo do contrato armazenado no servidor';
COMMENT ON COLUMN fechamentos.contrato_nome_original IS 'Nome original do arquivo enviado pelo usuário';
COMMENT ON COLUMN fechamentos.contrato_tamanho IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN fechamentos.contrato_upload_data IS 'Data e hora do upload do contrato'; 