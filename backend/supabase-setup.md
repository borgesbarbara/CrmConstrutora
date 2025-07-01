# 🗄️ Configuração do Supabase

## 📋 Passos para configurar o Supabase:

### 1️⃣ **Criar conta no Supabase**
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou crie uma conta

### 2️⃣ **Criar novo projeto**
1. Clique em "New Project"
2. Escolha sua organização
3. Defina um nome para o projeto
4. Defina uma senha para o banco
5. Escolha uma região (preferencialmente próxima ao Brasil)
6. Clique em "Create new project"

### 3️⃣ **Obter credenciais**
1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** (ex: https://xxx.supabase.co)
   - **anon/public key** (chave pública)

### 4️⃣ **Configurar variáveis de ambiente**
1. Crie um arquivo `.env` na pasta `backend/`
2. Adicione suas credenciais:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_KEY=sua-chave-anon-aqui
```

### 5️⃣ **Criar tabelas no Supabase**
1. Vá em **SQL Editor** no painel do Supabase
2. Execute o seguinte SQL:

```sql
-- Tabela de clínicas
CREATE TABLE IF NOT EXISTS clinicas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de consultores
CREATE TABLE IF NOT EXISTS consultores (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pacientes/leads
CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT,
  tipo_tratamento TEXT,
  status TEXT DEFAULT 'lead',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes(id),
  consultor_id INTEGER REFERENCES consultores(id),
  clinica_id INTEGER REFERENCES clinicas(id),
  data_agendamento DATE,
  horario TIME,
  status TEXT DEFAULT 'agendado',
  lembrado BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6️⃣ **Configurar RLS (Row Level Security) - Opcional**
Se quiser manter as tabelas públicas (para simplificar):

```sql
-- Desabilitar RLS para facilitar desenvolvimento
ALTER TABLE clinicas DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultores DISABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;
```

### 7️⃣ **Testar conexão**
1. Instale as dependências: `npm install`
2. Execute o servidor: `npm run dev`
3. Deve aparecer: "✅ Conexão com Supabase estabelecida com sucesso!"

## 🎯 **Vantagens do Supabase:**

- ✅ **Gratuito** até 500MB
- ✅ **Banco PostgreSQL** completo
- ✅ **Dashboard** visual para gerenciar dados
- ✅ **Backup automático**
- ✅ **Escalabilidade** automática
- ✅ **API REST** automática
- ✅ **Real-time** (se precisar no futuro)

## 🔧 **Troubleshooting:**

### **Erro de conexão:**
- Verifique se SUPABASE_URL e SUPABASE_KEY estão corretos
- Confirme se o arquivo .env está na pasta backend/

### **Erro "relation does not exist":**
- Execute novamente o SQL das tabelas no SQL Editor

### **Erro de permissão:**
- Desabilite RLS conforme instruções acima
- Ou configure políticas de segurança no painel

## 📊 **Acessar dados:**
Você pode ver e editar dados diretamente no painel:
**Database** > **Tables** > Selecione uma tabela 