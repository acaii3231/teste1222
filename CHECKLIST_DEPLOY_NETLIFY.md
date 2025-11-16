# ✅ Checklist Final - Deploy no Netlify

## 🎯 Status: PRONTO PARA DEPLOY!

### ✅ Configurações Verificadas

- [x] `netlify.toml` configurado corretamente
- [x] Funções Netlify criadas (`pix-create.ts` e `pix-check.ts`)
- [x] Cliente Supabase configurado com fallbacks
- [x] Build funcionando sem erros
- [x] Rotas de API configuradas
- [x] SPA rewrite configurado

---

## 🔑 Variáveis de Ambiente Obrigatórias no Netlify

Configure estas variáveis no Netlify Dashboard:

### 1. Supabase (OBRIGATÓRIAS)

```env
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenV0ZGxrZWVnd2lxa3BocWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjkwNDIsImV4cCI6MjA3ODg0NTA0Mn0.GPGf0fRQCgCJcEhb6RVfCgNxhDFz2uy_5in4lttO52M
```

### 2. PIX/Webhook (OPCIONAL - já tem fallback)

```env
WEBHOOK_URL=https://webhook.site/seu-codigo-unico
```

**Nota:** Se não configurar, usará o fallback padrão. Configure apenas se quiser receber webhooks de pagamento.

---

## 📋 Passo a Passo para Deploy

### 1. Configurar Variáveis no Netlify

1. Acesse: https://app.netlify.com
2. Selecione seu projeto
3. Vá em **Site settings** > **Environment variables**
4. Adicione as variáveis acima:
   - Clique em **Add a variable**
   - Cole o nome e valor
   - Selecione todos os scopes (Production, Deploy previews, Branch deploys)
   - Clique em **Save**

### 2. Conectar Repositório (se ainda não conectou)

1. No Netlify Dashboard, clique em **Add new site** > **Import an existing project**
2. Conecte com GitHub/GitLab/Bitbucket
3. Selecione o repositório
4. Configure:
   - **Build command:** `npm run build` (já configurado no `netlify.toml`)
   - **Publish directory:** `dist` (já configurado no `netlify.toml`)
5. Clique em **Deploy site**

### 3. Fazer Deploy

1. Se já conectou o repositório, o deploy é automático ao fazer push
2. Ou clique em **Deploys** > **Trigger deploy** > **Deploy site**
3. Aguarde o build completar

---

## ✅ Verificação Pós-Deploy

### 1. Testar Site Principal

1. Abra o site no navegador
2. Pressione **F12** para abrir o console
3. Procure por:
   - ✅ `Conexão com Supabase estabelecida` - Tudo OK!
   - ❌ Se aparecer erro, verifique as variáveis

### 2. Testar Painel Admin

1. Acesse `/admin` no site
2. Faça login
3. Verifique se:
   - ✅ Carrega sem tela branca
   - ✅ Transações aparecem
   - ✅ Upsells funcionam
   - ✅ Configurações salvam

### 3. Testar Checkout e PIX

1. Acesse a página de checkout
2. Preencha os dados
3. Tente gerar um PIX
4. Verifique se:
   - ✅ QR Code aparece
   - ✅ Código PIX é gerado
   - ✅ Status é verificado

---

## 🐛 Troubleshooting

### Erro: "Conexão com Supabase falhou"

**Solução:**
- Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` estão configuradas
- Verifique se fez redeploy após configurar as variáveis
- Verifique o console do navegador para ver o erro específico

### Erro: "404 NOT_FOUND" nas rotas de API

**Solução:**
- Verifique se o `netlify.toml` está na raiz do projeto
- Verifique se as funções estão em `netlify/functions/`
- Faça redeploy

### Painel Admin em Branco

**Solução:**
- Abra o console (F12) e veja os erros
- Verifique se o SQL foi executado no Supabase
- Verifique se as políticas RLS estão configuradas

### PIX não gera

**Solução:**
- Verifique os logs do Netlify Functions
- Verifique se o token PushinPay está correto
- Verifique se a função `pix-create` está funcionando

---

## 📁 Estrutura de Arquivos Verificada

```
✅ netlify.toml                    - Configuração do Netlify
✅ netlify/functions/pix-create.ts  - Função para criar PIX
✅ netlify/functions/pix-check.ts   - Função para verificar PIX
✅ src/integrations/supabase/client.ts - Cliente Supabase
✅ package.json                     - Dependências e scripts
✅ vite.config.ts                   - Configuração do Vite
✅ SUPABASE_SETUP_COMPLETO.sql      - Script SQL do Supabase
```

---

## 🎉 Tudo Pronto!

Após configurar as variáveis e fazer o deploy, tudo deve funcionar perfeitamente!

**Última verificação:**
- [ ] Variáveis configuradas no Netlify
- [ ] Deploy realizado
- [ ] Site funcionando
- [ ] Painel admin funcionando
- [ ] PIX funcionando

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique os logs do Netlify (Deploys > [seu deploy] > Functions logs)
2. Verifique o console do navegador (F12)
3. Verifique se o SQL foi executado no Supabase
4. Verifique se todas as variáveis estão configuradas

