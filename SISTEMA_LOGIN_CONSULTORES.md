# 🩺 Sistema de Login para Consultores

## 📋 **Visão Geral**
Agora o sistema suporta login individual para consultores! Cada consultor pode ter sua própria conta e ver apenas seus dados.

## 🚀 **Como Funciona**

### **1. Cadastro de Consultores (Admin)**
- Acesse: **Consultores** → **Novo Consultor**
- Preencha: Nome, Telefone e **Senha**
- A senha será hasheada automaticamente no backend

### **2. Login de Consultores**
- Use o **nome exato** do consultor + senha
- Exemplo: `André` + `123456`

### **3. Tipos de Login**

| Tipo | Campo Login | Acesso |
|------|-------------|--------|
| **Admin** | `admin@crm.com` | Todos os dados do sistema |
| **Consultor** | `Nome do Consultor` | Apenas seus próprios dados |

## 🔧 **Configuração Necessária**

### **1. Migração do Banco**
Execute no **Supabase SQL Editor**:

```sql
-- Migração 007: Adicionar campo senha para consultores
ALTER TABLE consultores ADD COLUMN IF NOT EXISTS senha TEXT;

-- Atualizar consultores existentes com senha hasheada padrão "123456"
UPDATE consultores 
SET senha = '$2b$10$/NEcv/je9DYAYUrbIbkc/.w8j0wFEFNbs0BUzoSuaFCvxHi/rtbD.' 
WHERE senha IS NULL;
```

### **2. Senhas Padrão**
- **Admin**: `admin123`
- **Consultores existentes**: `123456`

## 🎯 **Como Usar**

### **Login como Admin**
1. Campo: `admin@crm.com`
2. Senha: `admin123`
3. **Vê**: Todos os dados, todos os consultores

### **Login como Consultor**
1. Campo: `André` (nome exato)
2. Senha: `123456` (padrão) ou definida pelo admin
3. **Vê**: Apenas seus agendamentos, pacientes e fechamentos

## 🔐 **Segurança**

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ Tokens JWT separados por tipo de usuário
- ✅ Filtros automáticos baseados no tipo de login
- ✅ Validação de acesso em todas as rotas

## 📊 **Controle de Acesso**

### **Admin pode:**
- Ver todos os dados
- Cadastrar/editar consultores
- Ver dashboard completo
- Gerenciar clínicas

### **Consultor pode:**
- Ver apenas seus agendamentos
- Ver apenas pacientes dos seus agendamentos  
- Registrar fechamentos (seus)
- Ver dashboard pessoal

## 🎨 **Interface**

### **Tela de Login**
- Campo: "Email ou Nome"
- Botões demo: Admin e Consultor
- Design responsivo e moderno

### **Cadastro de Consultores**
- Campo senha obrigatório para novos consultores
- Campo senha opcional para edição (só atualiza se preenchido)

## 🛠️ **Para Desenvolvedores**

### **Token JWT inclui:**
```javascript
{
  id: usuario.id,
  nome: usuario.nome,
  tipo: 'admin' | 'consultor',
  consultor_id: id_do_consultor,
  email: email_ou_null
}
```

### **Middleware de autenticação:**
- `authenticateToken`: Válido para todos
- `requireAdmin`: Apenas administradores
- Filtros automáticos baseados em `req.user.tipo`

## 🎉 **Resultado Final**

✅ **Cada consultor** tem login individual  
✅ **Dados isolados** por consultor  
✅ **Interface intuitiva** para ambos tipos  
✅ **Segurança robusta** com hash de senhas  
✅ **Escalável** para muitos consultores 