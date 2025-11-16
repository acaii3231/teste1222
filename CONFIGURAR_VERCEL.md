# 🚀 Configuração do Vercel - Resolver Tela Branca

## ✅ Correções Realizadas

1. **Cliente Supabase** - Adicionado tratamento de erro para não quebrar se variáveis não estiverem configuradas
2. **Vite Config** - Adicionado `base: '/'` e configurações de build
3. **Vercel.json** - Configurado rewrites para SPA e rotas da API
4. **Error Handling** - Adicionado tratamento de erros globais no `main.tsx`
5. **useSiteInfo** - Adicionado verificação de variáveis antes de usar Supabase

## 🔧 Configuração Necessária no Vercel

### 1. Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
```

**Como encontrar essas variáveis:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 2. Framework Preset

No painel do Vercel, vá em **Settings > General** e verifique:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (já configurado)
- **Output Directory**: `dist`** (já configurado)
- **Install Command**: `npm install` (padrão)

### 3. Deploy

Após configurar as variáveis:
1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push

## 🐛 Troubleshooting

### Tela ainda está branca?

1. **Verifique o console do navegador** (F12 > Console)
   - Procure por erros em vermelho
   - Veja se há avisos sobre variáveis do Supabase

2. **Verifique os logs do Vercel**
   - Vá em **Deployments** > Clique no deploy
   - Veja a aba **Build Logs** e **Function Logs**

3. **Verifique se as variáveis estão configuradas**
   - Vá em **Settings > Environment Variables**
   - Certifique-se de que `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` estão definidas
   - **IMPORTANTE**: As variáveis devem começar com `VITE_` para funcionar no frontend

4. **Limpe o cache do navegador**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

### Erro 404 nas rotas da API?

As rotas `/api/pix/create` e `/api/pix/check-by-pixid/:id` devem funcionar automaticamente. Se não funcionarem:

1. Verifique se os arquivos estão na pasta `api/`
2. Verifique os logs do Vercel em **Function Logs**

## 📋 Checklist

- [ ] Variáveis `VITE_SUPABASE_URL` configurada no Vercel
- [ ] Variável `VITE_SUPABASE_PUBLISHABLE_KEY` configurada no Vercel
- [ ] Framework Preset configurado como "Vite"
- [ ] Deploy realizado após configurar variáveis
- [ ] Console do navegador verificado (sem erros críticos)

## ✅ Após Configurar

O site deve funcionar normalmente! Se ainda houver problemas, verifique os logs do Vercel e o console do navegador para identificar o erro específico.

