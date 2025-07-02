-- Migração 007: Adicionar campo senha para consultores
-- Executar no Supabase SQL Editor

ALTER TABLE consultores ADD COLUMN IF NOT EXISTS senha TEXT;

-- Atualizar consultores existentes com senha hasheada padrão "123456"
-- Hash bcrypt da senha "123456" (salt rounds: 10)
UPDATE consultores 
SET senha = '$2b$10$/NEcv/je9DYAYUrbIbkc/.w8j0wFEFNbs0BUzoSuaFCvxHi/rtbD.' 
WHERE senha IS NULL;

-- Comentário: Nova senha padrão para todos consultores: 123456
-- Eles podem alterar depois pelo sistema 