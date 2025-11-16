-- ============================================
-- SCRIPT COMPLETO PARA CONFIGURAR SUPABASE
-- Execute este script no SQL Editor do Supabase Dashboard
-- Este script configura TUDO para funcionar no Vercel
-- ============================================

-- ============================================
-- 1. CRIAR TABELAS (se não existirem)
-- ============================================

-- Tabela site_config
CREATE TABLE IF NOT EXISTS public.site_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_config_pkey PRIMARY KEY (id),
    CONSTRAINT site_config_key_key UNIQUE (key)
);

-- Tabela transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    cpf text NOT NULL,
    whatsapp text,
    upsell_added boolean DEFAULT false,
    total_value numeric(10,2) DEFAULT 67.00 NOT NULL,
    status text DEFAULT 'pending'::text,
    pix_id text,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

-- Tabela upsell_config
CREATE TABLE IF NOT EXISTS public.upsell_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text DEFAULT 'Oferta Especial: Consultoria Individual 1h'::text NOT NULL,
    description text DEFAULT 'Tenha 1 sessão por semana, com cronograma de dieta e rotina 100% personalizado.'::text NOT NULL,
    price text DEFAULT '197,00'::text NOT NULL,
    original_price text DEFAULT '297,00'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text DEFAULT 'https://via.placeholder.com/80x80'::text,
    "order" integer DEFAULT 1,
    active boolean DEFAULT true,
    CONSTRAINT upsell_config_pkey PRIMARY KEY (id)
);

-- Tabela blocked_ips
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address text NOT NULL,
    transaction_id uuid REFERENCES public.transactions(id),
    redirect_url text DEFAULT 'https://google.com',
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON public.blocked_ips(active);

-- ============================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. REMOVER POLÍTICAS ANTIGAS (evitar conflitos)
-- ============================================

-- site_config
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.site_config;
DROP POLICY IF EXISTS "Permitir inserção pública de configurações" ON public.site_config;
DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.site_config;

-- transactions
DROP POLICY IF EXISTS "Permitir leitura pública de transações" ON public.transactions;
DROP POLICY IF EXISTS "Permitir inserção pública de transações" ON public.transactions;
DROP POLICY IF EXISTS "Permitir atualização pública de transações" ON public.transactions;

-- upsell_config
DROP POLICY IF EXISTS "upsell_config_select_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_insert_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_update_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "upsell_config_delete_policy" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir inserção pública de upsells" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir atualização pública de configurações" ON public.upsell_config;
DROP POLICY IF EXISTS "Permitir exclusão pública de upsells" ON public.upsell_config;

-- blocked_ips
DROP POLICY IF EXISTS "Permitir leitura pública de IPs bloqueados" ON public.blocked_ips;
DROP POLICY IF EXISTS "Permitir inserção pública de IPs bloqueados" ON public.blocked_ips;
DROP POLICY IF EXISTS "Permitir atualização pública de IPs bloqueados" ON public.blocked_ips;
DROP POLICY IF EXISTS "Permitir exclusão pública de IPs bloqueados" ON public.blocked_ips;

-- ============================================
-- 5. CRIAR POLÍTICAS RLS PARA site_config
-- ============================================

CREATE POLICY "Permitir leitura pública de configurações" 
ON public.site_config FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Permitir inserção pública de configurações" 
ON public.site_config FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de configurações" 
ON public.site_config FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================
-- 6. CRIAR POLÍTICAS RLS PARA transactions
-- ============================================

CREATE POLICY "Permitir leitura pública de transações" 
ON public.transactions FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Permitir inserção pública de transações" 
ON public.transactions FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de transações" 
ON public.transactions FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================
-- 7. CRIAR POLÍTICAS RLS PARA upsell_config
-- ============================================

CREATE POLICY "upsell_config_select_policy" 
ON public.upsell_config FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "upsell_config_insert_policy" 
ON public.upsell_config FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "upsell_config_update_policy" 
ON public.upsell_config FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "upsell_config_delete_policy" 
ON public.upsell_config FOR DELETE 
TO anon, authenticated 
USING (true);

-- ============================================
-- 8. CRIAR POLÍTICAS RLS PARA blocked_ips
-- ============================================

CREATE POLICY "Permitir leitura pública de IPs bloqueados"
ON public.blocked_ips FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir inserção pública de IPs bloqueados"
ON public.blocked_ips FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de IPs bloqueados"
ON public.blocked_ips FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de IPs bloqueados"
ON public.blocked_ips FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================
-- 9. CRIAR BUCKET DE STORAGE PARA UPSELLS
-- ============================================

-- Criar o bucket (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'upsells',
  'upsells',
  true, -- Público para permitir acesso às imagens
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. POLÍTICAS DE STORAGE PARA UPSELLS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Permitir upload público de imagens de upsells" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de upsells" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de imagens de upsells" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de imagens de upsells" ON storage.objects;

-- Upload público
CREATE POLICY "Permitir upload público de imagens de upsells"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'upsells'
);

-- Leitura pública
CREATE POLICY "Permitir leitura pública de imagens de upsells"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'upsells');

-- Atualização
CREATE POLICY "Permitir atualização de imagens de upsells"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'upsells')
WITH CHECK (bucket_id = 'upsells');

-- Exclusão
CREATE POLICY "Permitir exclusão de imagens de upsells"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'upsells');

-- ============================================
-- 11. INSERIR UPSELL PADRÃO (se não existir)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.upsell_config LIMIT 1) THEN
    INSERT INTO public.upsell_config (
      title,
      description,
      price,
      original_price,
      image_url,
      "order",
      active
    ) VALUES (
      'Oferta Especial: Consultoria Individual 1h',
      'Tenha 1 sessão por semana, com cronograma de dieta e rotina 100% personalizado. Acompanhamento contínuo, ajustes semanais e acesso vitalício enquanto mantiver sua vaga. Transforme seu corpo e sua disciplina com orientação real e personalizada.',
      '197,00',
      '297,00',
      'https://via.placeholder.com/200x200',
      1,
      true
    );
    RAISE NOTICE '✅ Upsell padrão criado com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Já existe pelo menos um upsell no banco de dados.';
  END IF;
END $$;

-- ============================================
-- 12. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar tabelas criadas
SELECT 
  'Tabelas criadas:' as status,
  COUNT(*) FILTER (WHERE schemaname = 'public' AND tablename IN ('site_config', 'transactions', 'upsell_config', 'blocked_ips')) as total
FROM pg_tables;

-- Verificar upsells
SELECT 
  'Upsells cadastrados:' as status,
  COUNT(*) as total
FROM public.upsell_config;

-- Verificar bucket
SELECT 
  'Bucket criado:' as status,
  COUNT(*) as total
FROM storage.buckets
WHERE id = 'upsells';

-- ============================================
-- ✅ SCRIPT CONCLUÍDO!
-- ============================================
-- Agora seu Supabase está configurado para funcionar no Vercel!
-- ============================================

