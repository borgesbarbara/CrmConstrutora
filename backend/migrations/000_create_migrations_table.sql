-- MIGRAÇÃO 000: Criar tabela de controle de migrações
-- Esta deve ser a PRIMEIRA migração executada

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Inserir esta migração como executada
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('000', 'create_migrations_table', NOW())
ON CONFLICT (version) DO NOTHING; 