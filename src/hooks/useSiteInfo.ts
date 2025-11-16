import { useEffect } from 'react';
import { supabaseClient as supabase } from '@/lib/supabase-helpers';

export function useSiteInfo() {
  useEffect(() => {
    const loadSiteInfo = async () => {
      try {
        // Verificar se Supabase está configurado
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
          console.warn('⚠️ Supabase não configurado. Site info não será carregado.');
          return;
        }

        // Carregar título
        const { data: titleData, error: titleError } = await supabase
          .from('site_config' as any)
          .select('*')
          .eq('key', 'site_title')
          .maybeSingle();
        
        if (titleError) {
          console.warn('Erro ao carregar título:', titleError);
        } else if (titleData && (titleData as any).value) {
          document.title = (titleData as any).value;
        }

        // Carregar favicon
        const { data: faviconData, error: faviconError } = await supabase
          .from('site_config' as any)
          .select('*')
          .eq('key', 'favicon_url')
          .maybeSingle();
        
        if (faviconError) {
          console.warn('Erro ao carregar favicon:', faviconError);
        } else if (faviconData && (faviconData as any).value) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = (faviconData as any).value;
        }
      } catch (error) {
        console.error('Error loading site info:', error);
        // Não quebrar a aplicação se houver erro
      }
    };

    loadSiteInfo();
  }, []);
}

