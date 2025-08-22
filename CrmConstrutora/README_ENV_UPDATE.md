# Atualização das Variáveis de Ambiente - CRM Construtora

## 📋 Resumo das Mudanças

### ✅ **Removido:**
- `process.env.PORT` - Não usado no Vercel
- `SUPABASE_ANON_KEY` do backend - Apenas service key necessária

### ✅ **Mantido/Atualizado:**

## 🔧 Backend (`/backend/.env`)

```env
# Supabase Configuration
SUPABASE_URL=https://shngomyavivrqoxvypoe.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=54GMZtlsGN5cqEmjWiupZTR0Gis48TeRVdNqi2v+DI5qsTMwUkjPAia+OxaEIOyZWFt6X4mvYQQrzU1On48/eA==

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🌐 Frontend (`/frontend/.env`)

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://shngomyavivrqoxvypoe.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API URL
REACT_APP_API_URL=https://crm-construtora-one.vercel.app/api
```

## 🚀 API Vercel (`/api/.env`)

```env
# Supabase Configuration
SUPABASE_URL=https://shngomyavivrqoxvypoe.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=54GMZtlsGN5cqEmjWiupZTR0Gis48TeRVdNqi2v+DI5qsTMwUkjPAia+OxaEIOyZWFt6X4mvYQQrzU1On48/eA==

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🔄 Mudanças no Código

### `server.js` (Backend)
```javascript
// ANTES
const PORT = process.env.PORT || 5001;

// DEPOIS
const PORT = 5001;
```

### `app.js` (Backend)
```javascript
// Usa apenas:
// - SUPABASE_URL
// - SUPABASE_SERVICE_KEY
// - FRONTEND_URL (para CORS)
```

## 🎯 Benefícios

1. **Vercel Compatibility**: Sem dependência de `process.env.PORT`
2. **Segurança**: Backend usa apenas service key do Supabase
3. **Clareza**: Variáveis bem definidas para cada ambiente
4. **Produção**: Frontend aponta para API do Vercel

## ⚠️ Importante

- **Backend local**: Porta fixa 5001
- **Vercel**: Sem porta (serverless)
- **Frontend**: Aponta para `https://crm-construtora-one.vercel.app/api`
- **CORS**: Configurado para localhost:3000 (desenvolvimento)

## 🧪 Testando

### Backend Local
```bash
cd CrmConstrutora/backend
npm start
# Servidor roda na porta 5001
```

### Frontend
```bash
cd CrmConstrutora/frontend
npm start
# Aponta para API do Vercel
```

### API Vercel
```bash
# Deploy automático no Vercel
# Endpoint: https://crm-construtora-one.vercel.app/api/health
``` 