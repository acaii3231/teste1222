# 🔑 Todas as Variáveis de Ambiente para o Netlify

## ✅ Variáveis OBRIGATÓRIAS

Configure estas variáveis no Netlify para o projeto funcionar:

### 1. Supabase - URL
```
Key: VITE_SUPABASE_URL
Value: https://qpzutdlkeegwiqkphqkj.supabase.co
Scopes: Production, Deploy previews, Branch deploys
```

### 2. Supabase - Chave Anon
```
Key: VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenV0ZGxrZWVnd2lxa3BocWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjkwNDIsImV4cCI6MjA3ODg0NTA0Mn0.GPGf0fRQCgCJcEhb6RVfCgNxhDFz2uy_5in4lttO52M
Scopes: Production, Deploy previews, Branch deploys
```

---

## ⚙️ Variáveis OPCIONAIS

Estas variáveis já têm fallbacks, mas você pode configurar se quiser:

### 3. Webhook URL (Opcional)
```
Key: WEBHOOK_URL
Value: https://webhook.site/seu-codigo-unico
Scopes: Production, Deploy previews, Branch deploys
```

**Nota:** Se não configurar, a função PIX usará um fallback padrão. Configure apenas se quiser receber webhooks de pagamento.

---

## 📋 Como Configurar no Netlify

1. **Acesse o Netlify Dashboard:**
   - https://app.netlify.com
   - Selecione seu projeto

2. **Vá em Site settings:**
   - Menu lateral > **Site settings**
   - Clique em **Environment variables**

3. **Adicione cada variável:**
   - Clique em **Add a variable**
   - Cole o **Key** e **Value**
   - Selecione todos os **Scopes** (Production, Deploy previews, Branch deploys)
   - Clique em **Save**

4. **Faça Redeploy:**
   - Vá em **Deploys**
   - Clique em **Trigger deploy** > **Deploy site**

---

## ✅ Checklist Rápido

- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` configurada
- [ ] `WEBHOOK_URL` configurada (opcional)
- [ ] Redeploy realizado

---

## 🎯 Resumo

**Mínimo necessário:**
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_PUBLISHABLE_KEY` ✅

**Recomendado:**
- `WEBHOOK_URL` (para receber notificações de pagamento)

---

## ⚠️ Importante

- ✅ Use `VITE_` no início (não `NEXT_PUBLIC_` ou `REACT_APP_`)
- ✅ As variáveis são case-sensitive
- ✅ Após adicionar, faça redeploy
- ✅ Verifique os logs do Netlify se algo não funcionar

