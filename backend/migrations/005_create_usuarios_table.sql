-- Migração 005: Criar tabela de usuários
-- Execute este comando no SQL Editor do Supabase

-- Tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL, -- Hash da senha
  tipo TEXT CHECK (tipo IN ('admin', 'consultor')) DEFAULT 'consultor',
  consultor_id INTEGER REFERENCES consultores(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_consultor_id ON usuarios(consultor_id);

-- Inserir usuário administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo) 
VALUES ('Administrador', 'admin@crm.com', '$2b$10$8K1p/a9UOGNeMlvV7QT4..ZCdP9.VJK0Hk5QZY3oBz3Ohs/qJlm/G', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Atualizar timestamp de modificação automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE usuarios IS 'Tabela de usuários para autenticação do sistema';
COMMENT ON COLUMN usuarios.tipo IS 'Tipo de usuário: admin (acesso total) ou consultor (acesso limitado)';
COMMENT ON COLUMN usuarios.consultor_id IS 'ID do consultor vinculado (apenas para tipo consultor)'; 