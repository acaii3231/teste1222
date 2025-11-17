import { useEffect } from 'react';

export function useSiteInfo() {
  useEffect(() => {
    let isMounted = true;
    
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

        if (titleResult.status === 'fulfilled' && titleResult.value.data?.value) {
          document.title = titleResult.value.data.value;
        }

        if (faviconResult.status === 'fulfilled' && faviconResult.value.data?.value) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconResult.value.data.value;
        }
      } catch {
        // Ignorar erros silenciosamente
      }
    };

    const timeoutId = setTimeout(loadSiteInfo, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);
}

