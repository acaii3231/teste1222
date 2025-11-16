# 🔄 Migração de Vercel para Netlify - Resumo

## ✅ O que foi feito

1. **Removido:** `vercel.json` (renomeado para `vercel.json.bak`)
2. **Criado:** `netlify.toml` - Configuração do Netlify
3. **Criado:** `netlify/functions/` - Funções da API convertidas
4. **Atualizado:** `package.json` - Removido @vercel/node, adicionado @netlify/functions
5. **Atualizado:** `src/lib/pix-api.ts` - Agora usa Netlify
6. **Criado:** `CONFIGURAR_NETLIFY.md` - Guia completo

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- `netlify.toml` - Configuração do Netlify
- `netlify/functions/pix-create.ts` - Função para criar PIX
- `netlify/functions/pix-check.ts` - Função para verificar PIX
- `CONFIGURAR_NETLIFY.md` - Guia de configuração
- `MIGRACAO_VERCEL_PARA_NETLIFY.md` - Este arquivo

### Arquivos Modificados:
- `package.json` - Dependências atualizadas
- `src/lib/pix-api.ts` - Atualizado para Netlify
- `vercel.json` → `vercel.json.bak` - Arquivo antigo renomeado

### Arquivos Mantidos (ainda funcionam):
- `api/` - Mantido para referência, mas não usado no Netlify
- Todas as outras configurações

## 🚀 Próximos Passos

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Conectar no Netlify:**
   - Veja `CONFIGURAR_NETLIFY.md` para instruções detalhadas

3. **Configurar variáveis de ambiente:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **Fazer deploy!**

## ⚠️ Importante

- As rotas da API agora estão em `netlify/functions/`
- O formato das funções mudou (agora usam Handler do Netlify)
- O painel admin continua funcionando normalmente em `/admin`

## 🎯 Painel Admin

O painel admin não foi alterado. Se não está funcionando, verifique:
1. Se as variáveis do Supabase estão configuradas
2. Se o script SQL foi executado no Supabase
3. Console do navegador para erros

**Credenciais:**
- Usuário: `venom`
- Senha: `venom198`

