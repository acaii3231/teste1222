# 🚀 Configuração do Netlify - Guia Completo

## ✅ O que foi configurado

1. **netlify.toml** - Configuração do build e redirects
2. **Netlify Functions** - Rotas da API convertidas para Netlify
3. **pix-api.ts** - Atualizado para usar Netlify
4. **package.json** - Adicionado @netlify/functions

## 📋 Passo a Passo para Deploy

### 1. Instalar Dependências

```bash
npm install
```

### 2. Conectar no Netlify

1. Acesse: https://app.netlify.com
2. Faça login ou crie uma conta
3. Clique em **"Add new site"** > **"Import an existing project"**
4. Conecte com GitHub e selecione o repositório: `acaii3231/teste1222`

### 3. Configurar Build Settings

O Netlify detectará automaticamente:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Base directory:** (deixe vazio)

### 4. Configurar Variáveis de Ambiente

No Netlify, vá em **Site settings** > **Environment variables** e adicione:

```
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[sua_chave_anon_do_supabase]
WEBHOOK_URL=[opcional - URL do webhook para PIX]
```

**Como obter a chave anon:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a chave **"anon"** ou **"public"**

### 5. Fazer Deploy

1. Clique em **"Deploy site"**
2. Aguarde o build (2-3 minutos)
3. Quando terminar, você terá uma URL: `https://seu-projeto.netlify.app`

## 🔧 Estrutura das Funções

As funções da API estão em:
- `netlify/functions/pix-create.ts` - Criar PIX
- `netlify/functions/pix-check.ts` - Verificar status do PIX

## 🎯 Painel Admin

O painel admin está em: `/admin`

**Credenciais:**
- **Usuário:** `venom`
- **Senha:** `venom198`

## ⚠️ Importante

1. **Execute o script SQL no Supabase** antes de fazer deploy:
   - Use o arquivo `SUPABASE_SETUP_COMPLETO.sql`
   - Veja `COMO_USAR_SCRIPT_SUPABASE.md` para instruções

2. **Variáveis de ambiente** devem começar com `VITE_` para funcionar no frontend

3. **Netlify Functions** precisam do pacote `@netlify/functions` (já adicionado)

## 🐛 Troubleshooting

### Erro 404 nas rotas da API
- Verifique se as funções estão em `netlify/functions/`
- Verifique o `netlify.toml` se os redirects estão corretos

### Painel admin não carrega
- Verifique se as variáveis do Supabase estão configuradas
- Execute o script SQL no Supabase
- Verifique o console do navegador (F12) para erros

### Build falha
- Verifique se todas as dependências estão instaladas
- Verifique os logs do build no Netlify

## ✅ Checklist

- [ ] Executou script SQL no Supabase
- [ ] Configurou variáveis de ambiente no Netlify
- [ ] Fez deploy no Netlify
- [ ] Testou o painel admin em `/admin`
- [ ] Testou criação de PIX
- [ ] Testou verificação de status do PIX

## 🎉 Pronto!

Após seguir esses passos, seu site estará online no Netlify e funcionando perfeitamente!

