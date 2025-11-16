# 🔑 Variáveis de Ambiente para o Netlify

## ✅ Informações do Supabase

### URL do Supabase:
```
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
```

### Chave Pública (anon key):
```
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenV0ZGxrZWVnd2lxa3BocWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjkwNDIsImV4cCI6MjA3ODg0NTA0Mn0.GPGf0fRQCgCJcEhb6RVfCgNxhDFz2uy_5in4lttO52M
```

✅ **Chave anon configurada corretamente!**

## 🔧 Configurar no Netlify

### Passo a Passo:

1. **Acesse o Netlify Dashboard:**
   - Vá para: https://app.netlify.com
   - Selecione seu projeto

2. **Vá em Site settings > Environment variables:**
   - No menu lateral, clique em **Site settings**
   - Depois clique em **Environment variables**

3. **Adicione as Variáveis:**

   **Variável 1:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://qpzutdlkeegwiqkphqkj.supabase.co`
   - **Scopes:** Selecione todas (Production, Deploy previews, Branch deploys)

   **Variável 2:**
   - **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenV0ZGxrZWVnd2lxa3BocWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjkwNDIsImV4cCI6MjA3ODg0NTA0Mn0.GPGf0fRQCgCJcEhb6RVfCgNxhDFz2uy_5in4lttO52M`
   - **Scopes:** Selecione todas (Production, Deploy previews, Branch deploys)

4. **Salve e Faça Redeploy:**
   - Clique em **Save** para cada variável
   - Vá em **Deploys**
   - Clique em **Trigger deploy** > **Deploy site**

## 📝 Resumo das Variáveis

```env
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenV0ZGxrZWVnd2lxa3BocWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjkwNDIsImV4cCI6MjA3ODg0NTA0Mn0.GPGf0fRQCgCJcEhb6RVfCgNxhDFz2uy_5in4lttO52M
```

## ⚠️ Importante

- ✅ **Use `VITE_` no Netlify** (não `NEXT_PUBLIC_` - esse projeto usa Vite, não Next.js)
- ✅ A chave anon é segura para usar no frontend
- ✅ As variáveis devem começar com `VITE_` para funcionar no Vite
- ✅ Após adicionar as variáveis, faça um redeploy
- ✅ Chave anon já configurada corretamente!

## 🎯 Verificação

Após configurar e fazer o redeploy:

1. Abra o site no navegador
2. Pressione **F12** para abrir o console
3. Procure por:
   - ✅ `Conexão com Supabase estabelecida` - Tudo OK!
   - ❌ `Erro ao conectar com Supabase` - Verifique as variáveis

## 🐛 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a chave **anon** correta (não service_role)
- A chave anon geralmente começa com `eyJ...`

### Erro: "Failed to fetch"
- Verifique se a URL está correta
- Verifique se as variáveis estão configuradas no Netlify
- Faça um redeploy após configurar as variáveis

### Painel admin não carrega
- Verifique o console do navegador (F12)
- Veja se há erros relacionados ao Supabase
- Verifique se executou o script SQL no Supabase (`SUPABASE_SETUP_COMPLETO.sql`)

