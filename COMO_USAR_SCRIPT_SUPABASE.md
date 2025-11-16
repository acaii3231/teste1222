# 🚀 Como Usar o Script SQL no Supabase

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: `pzdjerxrqafbxbowncjf` (ou o projeto que usa a URL `qpzutdlkeegwiqkphqkj.supabase.co`)

### 2. Abra o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Cole o Script
- Abra o arquivo `SUPABASE_SETUP_COMPLETO.sql`
- Copie **TODO o conteúdo** (Ctrl+A, Ctrl+C)
- Cole no SQL Editor do Supabase (Ctrl+V)

### 4. Execute o Script
- Clique no botão **Run** (ou pressione Ctrl+Enter)
- Aguarde alguns segundos
- Você verá mensagens de sucesso no final

### 5. Verifique
- No final do script, você verá verificações mostrando:
  - ✅ Tabelas criadas
  - ✅ Upsells cadastrados
  - ✅ Bucket criado

## ✅ Pronto!

Agora seu Supabase está configurado e funcionará perfeitamente no Vercel!

## 📝 O que o Script Faz

1. ✅ Cria todas as tabelas (site_config, transactions, upsell_config, blocked_ips)
2. ✅ Cria índices para performance
3. ✅ Habilita Row Level Security (RLS)
4. ✅ Cria todas as políticas de permissão
5. ✅ Cria o bucket de storage para imagens de upsells
6. ✅ Configura políticas de storage
7. ✅ Insere um upsell padrão (se não existir)

## ⚠️ Importante

- Este script é **seguro** - ele não apaga dados existentes
- Pode executar quantas vezes quiser
- Se algo der erro, apenas leia a mensagem e me avise

## 🎯 Próximo Passo

Depois de executar o script, configure as variáveis no Vercel:
- `VITE_SUPABASE_URL` = `https://qpzutdlkeegwiqkphqkj.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = [chave anon do dashboard]

Veja o arquivo `VARIAVEIS_VERCEL.md` para mais detalhes.

