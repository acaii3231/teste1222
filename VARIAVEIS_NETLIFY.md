# 🔑 Variáveis de Ambiente para o Netlify

## ✅ Informações do Supabase

### URL do Supabase:
```
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
```

### Chave Pública (anon key):
⚠️ **IMPORTANTE:** O token fornecido (`sbp_00e09d9b0ae42f6023fc0ca3107d58b341c24525`) parece ser um token de projeto, não a chave anon/public.

**Você precisa obter a chave anon correta:**

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: `qpzutdlkeegwiqkphqkj`
3. Vá em **Settings** > **API**
4. Copie a chave **"anon"** ou **"public"** (não use service_role)
5. A chave anon geralmente começa com `eyJ...` (é um JWT)

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
   - **Value:** `[cole aqui a chave anon/public que você copiou do Supabase Dashboard]`
   - **Scopes:** Selecione todas (Production, Deploy previews, Branch deploys)

4. **Salve e Faça Redeploy:**
   - Clique em **Save** para cada variável
   - Vá em **Deploys**
   - Clique em **Trigger deploy** > **Deploy site**

## 📝 Resumo das Variáveis

```env
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[sua_chave_anon_do_dashboard]
```

## ⚠️ Importante

- ✅ Use a chave **"anon"** ou **"public"** (não a service_role)
- ✅ A chave anon é segura para usar no frontend
- ✅ As variáveis devem começar com `VITE_` para funcionar no Vite
- ✅ Após adicionar as variáveis, faça um redeploy
- ❌ **NÃO use** o token `sbp_...` - esse é um token de projeto, não a chave anon

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

