import { useEffect } from 'react';

export function useSiteInfo() {
  useEffect(() => {
    let isMounted = true;

    const applyFavicon = (href: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Fallback inicial para remover ícones do Lovable
    applyFavicon('/favicon.ico');

    const loadSiteInfo = async () => {
      if (!isMounted) return;

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) return;

        const { supabaseClient: supabase } = await import('@/lib/supabase-helpers');
        if (!supabase || !isMounted) return;

        const [titleResult, faviconResult] = await Promise.allSettled([
          supabase.from('site_config' as any).select('*').eq('key', 'site_title').maybeSingle(),
          supabase.from('site_config' as any).select('*').eq('key', 'favicon_url').maybeSingle()
        ]);

        if (!isMounted) return;

        if (titleResult.status === 'fulfilled') {
          const newTitle = titleResult.value.data?.value;
          if (newTitle) {
            document.title = newTitle;
          }
        }

        if (faviconResult.status === 'fulfilled') {
          const newFavicon = faviconResult.value.data?.value;
          if (newFavicon) {
            applyFavicon(newFavicon);
          }
        }
      } catch {
        // Ignorar erros silenciosamente para evitar quebrar o SSR
      }
    };

    loadSiteInfo();

    return () => {
      isMounted = false;
    };
  }, []);
}

