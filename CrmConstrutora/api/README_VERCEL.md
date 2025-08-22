# API CRM Construtora - Configuração Vercel

## 📋 Visão Geral

Esta pasta `/api` contém a configuração para deploy no Vercel usando serverless functions.

## 🏗️ Estrutura dos Arquivos

```
api/
├── index.js          # Entry point para Vercel (serverless-http)
├── package.json      # Dependências da API
├── vercel.json       # Configuração do Vercel
├── .env              # Variáveis de ambiente
└── README_VERCEL.md  # Esta documentação
```

## 🔧 Configuração

### Dependências
```json
{
  "serverless-http": "^3.2.0",
  "@supabase/supabase-js": "^2.55.0",
  "express": "^4.21.2",
  "cors": "^2.8.5",
  "dotenv": "^16.6.1"
}
```

### Arquivo index.js
```javascript
const serverless = require('serverless-http');
const app = require('../backend/app');

// Exportar o app Express como função serverless para Vercel
module.exports = serverless(app);
```

### Configuração Vercel (vercel.json)
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

## 🚀 Como Funciona

1. **serverless-http**: Wrapper que converte aplicações Express em funções serverless
2. **Importação do app**: Importa a aplicação Express do `../backend/app.js`
3. **Rewrites**: Redireciona todas as requisições `/api/*` para a função serverless
4. **Variáveis de ambiente**: Carregadas automaticamente pelo Vercel

## 📡 Endpoints Disponíveis

### Health Check
```http
GET /api/health
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

## 🔒 Variáveis de Ambiente

Configure no painel do Vercel:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key
FRONTEND_URL=https://seu-frontend.vercel.app
```

## 🧪 Testando Localmente

### Verificar se carrega corretamente
```bash
cd CrmConstrutora/api
node -e "const app = require('./index.js'); console.log('Tipo:', typeof app);"
```

### Testar endpoints
```bash
# Health check
curl https://seu-projeto.vercel.app/api/health

# Login
curl -X POST https://seu-projeto.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📦 Deploy

1. **Conectar repositório** no Vercel
2. **Configurar variáveis de ambiente** no painel
3. **Deploy automático** a cada push

## ⚠️ Importante

- O arquivo `index.js` **NÃO** chama `app.listen()`
- Usa `serverless-http` para compatibilidade com Vercel
- Todas as rotas começam com `/api`
- Variáveis de ambiente devem ser configuradas no Vercel

## 🔄 Fluxo de Requisições

1. Cliente faz requisição para `/api/health`
2. Vercel redireciona para `/api/index.js` (rewrite)
3. `serverless-http` processa a requisição
4. Aplicação Express (`../backend/app.js`) responde
5. Resposta retorna ao cliente

## 🎯 Benefícios

- ✅ **Serverless**: Escala automaticamente
- ✅ **Sem servidor**: Não precisa manter servidor rodando
- ✅ **Integração**: Funciona perfeitamente com Vercel
- ✅ **Performance**: Cold start otimizado
- ✅ **Custo**: Paga apenas pelo uso 