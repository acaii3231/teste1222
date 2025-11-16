# 🔑 Como Obter a Chave Anon do Supabase

## ⚠️ Problema Identificado

O token fornecido (`sbp_00e09d9b0ae42f6023fc0ca3107d58b341c24525`) **não é a chave anon correta**. 

Esse token retorna o erro: `Invalid API key`

## ✅ Solução: Obter a Chave Anon Correta

### Passo a Passo Visual:

1. **Acesse o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione seu Projeto:**
   - Clique no projeto: `qpzutdlkeegwiqkphqkj`
   - Ou procure pelo projeto na lista

3. **Acesse as Configurações:**
   - No menu lateral esquerdo, clique em **Settings** (⚙️)
   - Depois clique em **API**

4. **Encontre a Chave Anon:**
   - Na seção **Project API keys**, você verá duas chaves:
   
   ```
   ┌─────────────────────────────────────────┐
   │ Project API keys                        │
   ├─────────────────────────────────────────┤
   │ anon public                             │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← ✅ COPIE ESTA
   │                                         │
   │ service_role secret                     │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← ❌ NÃO USE ESTA
   └─────────────────────────────────────────┘
   ```

5. **Copie a Chave Anon:**
   - Clique no botão **👁️** (olho) ao lado de "anon public" para revelar
   - Clique no botão **📋** (copiar) para copiar
   - A chave é bem longa (mais de 200 caracteres)
   - Ela começa com `eyJ...` (é um JWT)

6. **Use no Netlify:**
   - Cole essa chave na variável `VITE_SUPABASE_PUBLISHABLE_KEY` no Netlify

## 📝 Exemplo de Chave Anon

Uma chave anon válida se parece com isso:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenV0ZGxrZWVnd2lxcGhwcWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzMjE2MDAsImV4cCI6MjAzMTkwNzYwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Características:**
- ✅ Começa com `eyJ...`
- ✅ Tem 3 partes separadas por pontos (.)
- ✅ É bem longa (200+ caracteres)
- ✅ É segura para usar no frontend

## ❌ O Que NÃO Usar

- ❌ Token `sbp_...` - Esse é um token de projeto, não a chave anon
- ❌ Chave `service_role` - Essa é secreta e só para backend
- ❌ Qualquer chave que não comece com `eyJ...`

## 🧪 Teste Após Configurar

Depois de configurar a chave correta no Netlify:

1. Faça um redeploy
2. Abra o site no navegador
3. Pressione **F12** para abrir o console
4. Procure por: `✅ Conexão com Supabase estabelecida`

Se aparecer esse mensagem, está tudo OK! 🎉

## 🐛 Ainda com Problemas?

Se mesmo com a chave anon correta ainda der erro:

1. Verifique se copiou a chave completa (sem espaços)
2. Verifique se a variável no Netlify está como `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Verifique se fez redeploy após configurar
4. Verifique o console do navegador para ver o erro específico

