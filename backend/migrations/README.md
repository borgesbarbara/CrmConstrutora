# 🔄 Sistema de Migrações

Sistema para gerenciar mudanças na estrutura do banco de dados sem perder dados.

## 📋 Como Usar

### **Para Aplicar TODAS as Migrações:**
1. Vá ao **SQL Editor** do Supabase
2. Copie e cole o arquivo `run_migrations.sql`
3. Execute o script completo
4. Todas as migrações serão aplicadas automaticamente

### **Para Aplicar UMA Migração Específica:**
1. Vá ao **SQL Editor** do Supabase  
2. Execute primeiro `000_create_migrations_table.sql` (se ainda não executou)
3. Execute a migração específica (ex: `001_add_clinicas_location_fields.sql`)

### **Para Verificar Migrações Executadas:**
```sql
SELECT * FROM schema_migrations ORDER BY version;
```

## 📁 Arquivos Disponíveis

- `000_create_migrations_table.sql` - Cria tabela de controle (SEMPRE executar primeiro)
- `001_add_clinicas_location_fields.sql` - Adiciona campos bairro/cidade nas clínicas
- `run_migrations.sql` - **SCRIPT COMPLETO** para executar todas as migrações
- `migration-clinicas.sql` - Migração simplificada (compatibilidade)

## ✅ Migrações Disponíveis

| Versão | Nome | Descrição |
|--------|------|-----------|
| 000 | create_migrations_table | Cria tabela de controle de migrações |
| 001 | add_clinicas_location_fields | Adiciona campos bairro e cidade nas clínicas |

## 🚀 Vantagens

- ✅ **Sem perda de dados** - Altera estrutura preservando dados existentes
- ✅ **Controle de versão** - Sabe quais migrações já foram executadas  
- ✅ **Idempotente** - Pode executar várias vezes sem erro
- ✅ **Organizado** - Uma migração por mudança
- ✅ **Documentado** - Cada mudança tem descrição

## 🔮 Próximas Migrações

Quando precisar de novas mudanças no banco:
1. Crie arquivo `002_nome_da_mudanca.sql`
2. Adicione a migração em `run_migrations.sql`
3. Execute no Supabase
4. Sistema fica sempre atualizado sem recriar tabelas! 