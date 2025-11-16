# 🔑 Variáveis de Ambiente para o Vercel

## ✅ Informações Encontradas no Projeto

### URL do Supabase (já encontrada):
```
VITE_SUPABASE_URL=https://qpzutdlkeegwiqkphqkj.supabase.co
```

### Chave Pública (anon key) - Precisa buscar no Dashboard

A chave pública é diferente da chave de serviço. Você precisa obtê-la no dashboard do Supabase.

## 📋 Como Obter a Chave Pública (anon key)

1. **Acesse o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione o Projeto:**
   - O projeto ID é: `pzdjerxrqafbxbowncjf`
   - Ou procure pelo projeto que usa a URL: `qpzutdlkeegwiqkphqkj.supabase.co`

3. **Vá em Settings > API:**
   - No menu lateral, clique em **Settings** (Configurações)
   - Depois clique em **API**

4. **Copie a Chave Pública:**
   - Procure por **"Project API keys"**
   - Copie a chave que está em **"anon"** ou **"public"**
   - ⚠️ **NÃO use a chave "service_role"** (essa é privada e não deve ser usada no frontend)

## 🔧 Configurar no Vercel

### Passo a Passo:

1. **Acesse o Vercel Dashboard:**
   - Vá para: https://vercel.com/dashboard
   - Selecione seu projeto

2. **Vá em Settings > Environment Variables:**
   - No menu lateral, clique em **Settings**
   - Depois clique em **Environment Variables**

3. **Adicione as Variáveis:**

   **Variável 1:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://qpzutdlkeegwiqkphqkj.supabase.co`
   - **Environment:** Selecione todas (Production, Preview, Development)

   **Variável 2:**
   - **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value:** `[cole aqui a chave anon/public que você copiou do Supabase]`
   - **Environment:** Selecione todas (Production, Preview, Development)

4. **Salve e Faça Redeploy:**
   - Clique em **Save** para cada variável
   - Vá em **Deployments**
   - Clique nos **3 pontos** do último deploy
   - Selecione **Redeploy**

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

## 🎯 Verificação

Após configurar e fazer o redeploy, verifique:

1. Abra o site no navegador
2. Pressione **F12** para abrir o console
3. Procure por avisos sobre variáveis do Supabase
4. Se não houver avisos, está tudo configurado corretamente! ✅

