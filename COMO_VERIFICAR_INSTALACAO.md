# ✅ Como Verificar a Instalação do Supabase

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Selecione o projeto: `qpzutdlkeegwiqkphqkj`

### 2. Abra o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Execute o Script de Verificação
- Abra o arquivo `VERIFICAR_INSTALACAO.sql`
- Copie **TODO o conteúdo**
- Cole no SQL Editor do Supabase
- Clique em **Run**

### 4. Interprete os Resultados

O script retorna várias tabelas de verificação. Procure por:

#### ✅ **Status OK** - Tudo funcionando!
- `✅ OK` - Item configurado corretamente
- `✅ INSTALAÇÃO COMPLETA!` - Tudo pronto!

#### ❌ **Status com Erro** - Precisa corrigir
- `❌ FALTANDO TABELAS` - Execute o script de instalação novamente
- `❌ RLS NÃO HABILITADO` - Execute o script de instalação novamente
- `❌ POLÍTICAS FALTANDO` - Execute o script de instalação novamente
- `❌ BUCKET NÃO CRIADO` - Execute o script de instalação novamente

#### ⚠️ **Avisos** - Normal, mas pode melhorar
- `⚠️ NENHUM UPSELL` - Normal se não criou upsells ainda
- `⚠️ VERIFIQUE OS ITENS ACIMA` - Algum item precisa atenção

## 📊 O que o Script Verifica

1. **Tabelas** - Verifica se todas as 4 tabelas foram criadas
2. **RLS** - Verifica se Row Level Security está habilitado
3. **Políticas RLS** - Verifica se todas as políticas foram criadas
4. **Índices** - Verifica se os índices de performance foram criados
5. **Bucket Storage** - Verifica se o bucket 'upsells' foi criado
6. **Políticas Storage** - Verifica se as políticas de storage foram criadas
7. **Upsells** - Verifica se há upsells cadastrados
8. **Estrutura** - Verifica se as colunas das tabelas estão corretas
9. **Permissões** - Testa se consegue ler as tabelas
10. **Resumo Final** - Mostra um resumo geral

## 🎯 Resultado Esperado

Se tudo estiver OK, você verá:

```
✅ Tabelas criadas: 4
✅ RLS habilitado em todas as tabelas
✅ Políticas RLS criadas (pelo menos 3-4 por tabela)
✅ Índices criados
✅ Bucket criado: 1
✅ Políticas de storage criadas: 4
✅ INSTALAÇÃO COMPLETA!
```

## 🐛 Se Algo Estiver Errado

1. **Execute o script de instalação novamente:**
   - Use o arquivo `SUPABASE_SETUP_COMPLETO.sql`
   - Ele é seguro e pode ser executado várias vezes

2. **Verifique os erros específicos:**
   - O script de verificação mostra exatamente o que está faltando
   - Corrija item por item se necessário

3. **Entre em contato:**
   - Se houver erros que não consegue resolver, me mostre os resultados do script de verificação

## ✅ Próximo Passo

Após verificar que tudo está OK:
1. Configure as variáveis no Netlify (veja `VARIAVEIS_NETLIFY.md`)
2. Faça deploy no Netlify
3. Teste o painel admin em `/admin`

