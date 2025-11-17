import { useEffect } from 'react';

export function useSiteInfo() {
  useEffect(() => {
    let mounted = true;
    
    // Usar requestAnimationFrame e setTimeout para garantir que está fora do ciclo de renderização
    const loadInfo = async () => {
      try {
        // Verificar se Supabase está configurado
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
          if (mounted) {
            console.warn('⚠️ Supabase não configurado. Site info não será carregado.');
          }
          return;
        }

        // Importar Supabase dinamicamente para evitar problemas de inicialização
        const { supabaseClient: supabase } = await import('@/lib/supabase-helpers');
        
        if (!mounted || !supabase) {
          if (mounted) {
            console.warn('⚠️ Supabase não disponível. Site info não será carregado.');
          }
          return;
        }

        // Carregar título
        try {
          const { data: titleData, error: titleError } = await supabase
            .from('site_config' as any)
            .select('*')
            .eq('key', 'site_title')
            .maybeSingle();
          
          if (!mounted) return;
          
          if (titleError) {
            console.warn('Erro ao carregar título:', titleError);
          } else if (titleData && (titleData as any).value) {
            document.title = (titleData as any).value;
          }
        } catch (titleErr) {
          if (mounted) {
            console.warn('Erro ao carregar título:', titleErr);
          }
        }

        // Carregar favicon
        try {
          const { data: faviconData, error: faviconError } = await supabase
            .from('site_config' as any)
            .select('*')
            .eq('key', 'favicon_url')
            .maybeSingle();
          
          if (!mounted) return;
          
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
        } catch (faviconErr) {
          if (mounted) {
            console.warn('Erro ao carregar favicon:', faviconErr);
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Error loading site info:', error);
        }
        // Não quebrar a aplicação se houver erro
      }
    };

    // Usar requestAnimationFrame para garantir que está no próximo frame
    requestAnimationFrame(() => {
      setTimeout(loadInfo, 100);
    });

    return () => {
      mounted = false;
    };
  }, []);
}

