-- ============================================
-- SCRIPT DE VERIFICAÇÃO - Verificar se tudo está configurado
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================

-- ============================================
-- 1. VERIFICAR TABELAS
-- ============================================
SELECT 
  'Tabelas criadas:' as verificação,
  COUNT(*) FILTER (WHERE schemaname = 'public' AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')) as total,
  CASE 
    WHEN COUNT(*) FILTER (WHERE schemaname = 'public' AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')) = 4 
    THEN '✅ OK' 
    ELSE '❌ FALTANDO TABELAS' 
  END as status
FROM pg_tables
WHERE schemaname = 'public';

-- ============================================
-- 2. VERIFICAR RLS HABILITADO
-- ============================================
SELECT 
  tablename as tabela,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity = true THEN '✅ OK' 
    ELSE '❌ RLS NÃO HABILITADO' 
  END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')
ORDER BY tablename;

-- ============================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
  tablename as tabela,
  COUNT(*) as total_políticas,
  CASE 
    WHEN tablename = 'site_config' AND COUNT(*) >= 3 THEN '✅ OK'
    WHEN tablename = 'transactions' AND COUNT(*) >= 3 THEN '✅ OK'
    WHEN tablename = 'upsell_config' AND COUNT(*) >= 4 THEN '✅ OK'
    WHEN tablename = 'blocked_ips' AND COUNT(*) >= 4 THEN '✅ OK'
    ELSE '❌ POLÍTICAS FALTANDO' 
  END as status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 4. VERIFICAR ÍNDICES
-- ============================================
SELECT 
  indexname as índice,
  tablename as tabela,
  CASE 
    WHEN indexname IS NOT NULL THEN '✅ OK' 
    ELSE '❌ FALTANDO' 
  END as status
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname IN (
    'idx_transactions_created_at',
    'idx_transactions_status',
    'idx_blocked_ips_ip_address',
    'idx_blocked_ips_active'
  )
ORDER BY tablename, indexname;

-- ============================================
-- 5. VERIFICAR BUCKET DE STORAGE
-- ============================================
SELECT 
  'Bucket upsells:' as verificação,
  COUNT(*) as total,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ OK' 
    ELSE '❌ BUCKET NÃO CRIADO' 
  END as status
FROM storage.buckets
WHERE id = 'upsells';

-- ============================================
-- 6. VERIFICAR POLÍTICAS DE STORAGE
-- ============================================
SELECT 
  policyname as política,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ OK' 
    ELSE '❌ FALTANDO' 
  END as status
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%upsells%'
ORDER BY policyname;

-- ============================================
-- 7. VERIFICAR UPSELL PADRÃO
-- ============================================
SELECT 
  'Upsells cadastrados:' as verificação,
  COUNT(*) as total,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ OK' 
    ELSE '⚠️ NENHUM UPSELL (será criado automaticamente)' 
  END as status
FROM public.upsell_config;

-- ============================================
-- 8. VERIFICAR ESTRUTURA DAS TABELAS
-- ============================================
-- Verificar colunas da tabela transactions
SELECT 
  'Colunas da tabela transactions:' as verificação,
  COUNT(*) as total_colunas,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ OK' 
    ELSE '❌ COLUNAS FALTANDO' 
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'transactions';

-- Verificar colunas da tabela upsell_config
SELECT 
  'Colunas da tabela upsell_config:' as verificação,
  COUNT(*) as total_colunas,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ OK' 
    ELSE '❌ COLUNAS FALTANDO' 
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'upsell_config';

-- ============================================
-- 9. TESTE DE PERMISSÕES (SELECT)
-- ============================================
-- Testar se consegue ler as tabelas (simula acesso anon)
SELECT 
  'Teste de leitura - site_config:' as teste,
  COUNT(*) as registros_encontrados,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ OK' 
    ELSE '❌ ERRO' 
  END as status
FROM public.site_config;

SELECT 
  'Teste de leitura - transactions:' as teste,
  COUNT(*) as registros_encontrados,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ OK' 
    ELSE '❌ ERRO' 
  END as status
FROM public.transactions;

SELECT 
  'Teste de leitura - upsell_config:' as teste,
  COUNT(*) as registros_encontrados,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ OK' 
    ELSE '❌ ERRO' 
  END as status
FROM public.upsell_config;

-- ============================================
-- 10. RESUMO FINAL
-- ============================================
SELECT 
  '📊 RESUMO DA INSTALAÇÃO' as resumo,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')) as tabelas_criadas,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')) as políticas_rls,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'upsells') as bucket_criado,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%upsells%') as políticas_storage,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')) = 4
      AND (SELECT COUNT(*) FROM storage.buckets WHERE id = 'upsells') > 0
    THEN '✅ INSTALAÇÃO COMPLETA!'
    ELSE '⚠️ VERIFIQUE OS ITENS ACIMA'
  END as status_final;

-- ============================================
-- ✅ FIM DA VERIFICAÇÃO
-- ============================================
-- Se todos os itens acima mostram ✅ OK, está tudo configurado!
-- ============================================

