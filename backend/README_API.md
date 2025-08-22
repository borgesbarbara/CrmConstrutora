# API CRM Construtora - Documentação

## 📋 Visão Geral

Esta API foi refatorada para seguir as melhores práticas de desenvolvimento Node.js/Express, com separação clara entre a configuração da aplicação (`app.js`) e o servidor (`server.js`).

## 🏗️ Estrutura dos Arquivos

```
backend/
├── app.js          # Configuração da aplicação Express
├── server.js       # Inicialização do servidor
├── .env            # Variáveis de ambiente
└── package.json    # Dependências
```

## 🚀 Como Executar

### Desenvolvimento
```bash
cd CrmConstrutora/backend
npm run dev
```

### Produção
```bash
cd CrmConstrutora/backend
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key
FRONTEND_URL=http://localhost:3000
PORT=5001
```

## 📡 Endpoints da API

### Health Check
```http
GET /api/health
```

**Resposta:**
```json
{
  "ok": true
}
```

### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "token",
    "refresh_token": "refresh_token"
  }
}
```

**Resposta de Erro:**
```json
{
  "error": "Invalid login credentials"
}
```

## 🔒 Middlewares Configurados

### CORS
- Origin: Configurável via `FRONTEND_URL`
- Credentials: `true`
- Métodos: Todos os métodos HTTP

### JSON Parser
- Limite: Padrão do Express
- Suporte a JSON e URL-encoded

### Tratamento de Erros
- Middleware global para capturar erros
- Resposta padronizada de erro

## 🗄️ Integração com Supabase

### Cliente Supabase
```javascript
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### Autenticação
- Usa `supabase.auth.signInWithPassword()` para login
- Retorna dados do usuário e sessão

## 🧪 Testando a API

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Login
```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📦 Dependências

### Principais
- `express`: Framework web
- `cors`: Middleware CORS
- `@supabase/supabase-js`: Cliente Supabase
- `dotenv`: Gerenciamento de variáveis de ambiente

### Desenvolvimento
- `nodemon`: Auto-reload em desenvolvimento

## 🔄 Próximos Passos

Para expandir a API, adicione novas rotas em `app.js`:

```javascript
// Exemplo de nova rota
app.get('/api/users', async (req, res) => {
  try {
    // Lógica da rota
    res.json({ users: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## ⚠️ Importante

- O arquivo `app.js` exporta apenas a instância do Express
- O `server.js` é responsável por iniciar o servidor
- Todas as rotas começam com `/api`
- Middlewares de erro são aplicados globalmente 