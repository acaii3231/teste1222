import { useEffect } from 'react';

export function useSiteInfo() {
  useEffect(() => {
    const loadSiteInfo = async () => {
      try {
        // Verificar se Supabase está configurado
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
          return;
        }

        // Importar Supabase dinamicamente
        const { supabaseClient: supabase } = await import('@/lib/supabase-helpers');
        
        if (!supabase) {
          return;
        }

        // Carregar título
        const { data: titleData } = await supabase
          .from('site_config' as any)
          .select('*')
          .eq('key', 'site_title')
          .maybeSingle();
        
        if (titleData && (titleData as any).value) {
          document.title = (titleData as any).value;
        }

        // Carregar favicon
        const { data: faviconData } = await supabase
          .from('site_config' as any)
          .select('*')
          .eq('key', 'favicon_url')
          .maybeSingle();
        
        if (faviconData && (faviconData as any).value) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = (faviconData as any).value;
        }
      } catch (error) {
        // Silenciosamente ignorar erros para não quebrar a aplicação
      }
    };

    // Delay para garantir que tudo está inicializado
    const timeoutId = setTimeout(loadSiteInfo, 200);

    return () => clearTimeout(timeoutId);
  }, []);
}

