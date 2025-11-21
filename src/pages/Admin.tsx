import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/InputField";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { UpsellsTab } from "@/components/admin/UpsellsTab";
import { TransactionsTab } from "@/components/admin/TransactionsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { FieldsConfigTab } from "@/components/admin/FieldsConfigTab";
import { SecurityTab } from "@/components/admin/SecurityTab";
import { PaymentTab } from "@/components/admin/PaymentTab";
import { ChatBot } from "@/components/admin/ChatBot";

interface Transaction {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  value: string;
  date: string;
  status: string;
  upsell_added?: boolean;
  ip_address?: string;
}

const Admin = () => {
  // Verificar se já está logado (persistência de sessão)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('admin_logged_in');
    return saved === 'true';
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [facebookPixelId, setFacebookPixelId] = useState("1352925696565772");
  const [facebookToken, setFacebookToken] = useState("EAAQmsFtPWZA4BP9ZALSFn9BrwBtrxW9tGpJz6ZBkPJXpswI0eS9BAoYm5kyhEm5PHiNZA5bSudEF7BACGnrnUruhc7YNOqrEfHxneWJYb6CF1ZAc1oqzwPvo5m6jHrZAXTZC9CeOXV5S4rVXcekylZCEuoDetyyfEjRuGwmeQZCQiZCvcEdh8VXFSZA7gcTVyuMZBw1qWwZDZD");
  const [tiktokPixelId, setTiktokPixelId] = useState("D4G5SC3C77U1VUV8KOS0");
  const [tiktokAccessToken, setTiktokAccessToken] = useState("23000e4ab10292aeebe600f60d376b60f2291786");
  const [pixelOnCheckout, setPixelOnCheckout] = useState(true);
  const [pixelOnPurchase, setPixelOnPurchase] = useState(true);
  const [tiktokTrackViewContent, setTiktokTrackViewContent] = useState(true);
  const [tiktokTrackAddToCart, setTiktokTrackAddToCart] = useState(true);
  const [tiktokTrackCheckout, setTiktokTrackCheckout] = useState(true);
  const [tiktokTrackPurchase, setTiktokTrackPurchase] = useState(true);
  const [isLoading, setIsLoading] = useState(() => {
    // Se não está logado, não precisa carregar
    const saved = localStorage.getItem('admin_logged_in');
    return saved === 'true';
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Upsell configuration
  interface Upsell {
    id: string;
    title: string;
    description: string;
    price: string;
    original_price: string;
    image_url: string;
    order: number;
    active: boolean;
  }
  
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    conversionRate: 0,
    averageTicket: 0,
    pendingOrders: 0,
    paidOrders: 0,
    upsellConversion: 0,
  });
  
  const { toast } = useToast();

  // Transactions from database
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [backupsAvailable, setBackupsAvailable] = useState(true);

  // Função para carregar configurações do pixel
  const loadPixelConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config' as any)
        .select('*')
        .in('key', [
          'facebook_pixel_id',
          'facebook_token',
          'pixel_on_checkout',
          'pixel_on_purchase',
          'tiktok_pixel_id',
          'tiktok_access_token',
          'tiktok_track_viewcontent',
          'tiktok_track_add_to_cart',
          'tiktok_track_checkout',
          'tiktok_track_purchase'
        ]);
      
      if (error) return;
      
      if (data && data.length > 0) {
        (data as any[]).forEach((config: any) => {
          if (config.key === 'facebook_pixel_id') setFacebookPixelId(config.value);
          if (config.key === 'facebook_token') setFacebookToken(config.value);
          if (config.key === 'pixel_on_checkout') setPixelOnCheckout(config.value === 'true');
          if (config.key === 'pixel_on_purchase') setPixelOnPurchase(config.value === 'true');
          if (config.key === 'tiktok_pixel_id') setTiktokPixelId(config.value);
          if (config.key === 'tiktok_access_token') setTiktokAccessToken(config.value);
          if (config.key === 'tiktok_track_viewcontent') setTiktokTrackViewContent(config.value !== 'false');
          if (config.key === 'tiktok_track_add_to_cart') setTiktokTrackAddToCart(config.value !== 'false');
          if (config.key === 'tiktok_track_checkout') setTiktokTrackCheckout(config.value !== 'false');
          if (config.key === 'tiktok_track_purchase') setTiktokTrackPurchase(config.value !== 'false');
        });
      }
    } catch (error) {
      // Ignorar erros silenciosamente
    }
  };
  
  // Função para carregar upsells
  const loadUpsellConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('upsell_config' as any)
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        setUpsells([]);
        return;
      }
      
      if (data) {
        setUpsells(data as Upsell[]);
      } else {
        setUpsells([]);
      }
    } catch (error) {
      setUpsells([]);
    }
  };

  // Load transactions from database
  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        setLoadError(`Erro ao carregar transações: ${error.message || 'Erro desconhecido'}. Verifique a conexão com o Supabase.`);
        setTransactions([]);
        return;
      }
    
      if (data) {
        const formattedTransactions: Transaction[] = (data as any[]).map((t: any) => ({
          id: t.id,
          name: t.name || 'Não informado',
          phone: t.phone || t.whatsapp || '',
          email: t.email || '',
          cpf: t.cpf || '',
          value: `R$ ${(t.total_value || 0).toFixed(2).replace('.', ',')}`,
          date: t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR') : 'N/A',
          status: t.status === 'paid' ? 'Pago' : t.status === 'awaiting_payment' ? 'Aguardando' : 'Pendente',
          upsell_added: t.upsell_added || false,
          ip_address: t.ip_address || undefined,
        }));
        
        setTransactions(formattedTransactions);
        setLoadError(null);
        
        // Calculate dashboard stats
        const totalSales = (data as any[]).length;
        const totalRevenue = (data as any[]).reduce((sum: number, t: any) => sum + (Number(t.total_value) || 0), 0);
        const paidRevenue = (data as any[]).filter((t: any) => t.status === 'paid').reduce((sum: number, t: any) => sum + (Number(t.total_value) || 0), 0);
        const paidOrders = (data as any[]).filter((t: any) => t.status === 'paid').length;
        const pendingOrders = (data as any[]).filter((t: any) => t.status !== 'paid').length;
        const ordersWithUpsell = (data as any[]).filter((t: any) => t.upsell_added).length;
        
        setDashboardStats({
          totalSales,
          totalRevenue,
          paidRevenue,
          conversionRate: totalSales > 0 ? (paidOrders / totalSales) * 100 : 0,
          averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
          pendingOrders,
          paidOrders,
          upsellConversion: totalSales > 0 ? (ordersWithUpsell / totalSales) * 100 : 0,
        });
      } else {
        setTransactions([]);
      }
    } catch (error: any) {
      setLoadError(`Erro inesperado: ${error.message || 'Erro desconhecido'}. Tente atualizar a página.`);
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    
    const loadAllData = async () => {
      try {
        // Carregar em paralelo, mas com tratamento individual de erros
        await Promise.allSettled([
          loadTransactions(),
          loadUpsellConfig(),
          loadPixelConfig()
        ]);
      } catch (error) {
        setLoadError('Erro crítico ao carregar dados. Verifique a conexão com o Supabase e tente atualizar a página.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
      
    // Subscribe realtime para transações
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    // Subscribe realtime para upsells
    const upsellsChannel = supabase
      .channel('upsells-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'upsell_config'
        },
        () => {
          loadUpsellConfig();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(upsellsChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (username === "venom" && password === "venom198") {
      setIsLoggedIn(true);
      // Salvar sessão no localStorage
      localStorage.setItem('admin_logged_in', 'true');
      // Limpar campos
      setUsername("");
      setPassword("");
      toast({
        description: "Login realizado",
      });
    } else {
      toast({
        description: "Credenciais inválidas",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
    toast({
      description: "Logout realizado",
    });
  };

  const savePixelConfig = async () => {
    const configs = [
      { key: 'facebook_pixel_id', value: facebookPixelId },
      { key: 'facebook_token', value: facebookToken },
      { key: 'pixel_on_checkout', value: String(pixelOnCheckout) },
      { key: 'pixel_on_purchase', value: String(pixelOnPurchase) },
      { key: 'tiktok_pixel_id', value: tiktokPixelId },
      { key: 'tiktok_access_token', value: tiktokAccessToken },
      { key: 'tiktok_track_viewcontent', value: String(tiktokTrackViewContent) },
      { key: 'tiktok_track_add_to_cart', value: String(tiktokTrackAddToCart) },
      { key: 'tiktok_track_checkout', value: String(tiktokTrackCheckout) },
      { key: 'tiktok_track_purchase', value: String(tiktokTrackPurchase) },
    ];
    
    for (const config of configs) {
      await supabase
        .from('site_config' as any)
        .upsert({ key: config.key, value: config.value }, { onConflict: 'key' });
    }
    
    toast({
      description: "Configurações salvas",
    });
  };

  const exportTransactionsByPeriod = async () => {
    const monthSelect = document.getElementById('export-month') as HTMLSelectElement;
    const yearInput = document.getElementById('export-year') as HTMLInputElement;
    
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearInput.value);
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const { data, error} = await supabase
      .from('transactions' as any)
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        description: "Erro ao exportar",
        variant: "destructive",
      });
      return;
    }
    
    if (!data || data.length === 0) {
      toast({
        description: "Nenhuma transação encontrada",
      });
      return;
    }
    
    // Create CSV
    const headers = ['Nome', 'Email', 'Telefone', 'CPF', 'Valor', 'Data', 'Status'];
    const rows = (data as any[]).map((t: any) => [
      t.name,
      t.email,
      t.phone,
      t.cpf,
      `R$ ${t.total_value.toFixed(2).replace('.', ',')}`,
      new Date(t.created_at).toLocaleDateString('pt-BR'),
      t.status === 'paid' ? 'Pago' : t.status === 'awaiting_payment' ? 'Aguardando' : 'Pendente'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${month}_${year}.csv`;
    link.click();
    
    toast({
      description: `${data.length} transações exportadas`,
    });
  };

  const exportPaidEmails = async () => {
    const { data, error } = await supabase
      .from('transactions' as any)
      .select('email')
      .eq('status', 'paid');
    
    if (error) {
      toast({
        description: "Erro ao exportar",
        variant: "destructive",
      });
      return;
    }
    
    if (!data || data.length === 0) {
      toast({
        description: "Nenhum cliente pago encontrado",
      });
      return;
    }
    
    const emails = (data as any[]).map((t: any) => t.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emails_clientes_pagos.txt`;
    link.click();
    
    toast({
      description: `${data.length} emails exportados`,
    });
  };

  const exportAllEmails = async () => {
    const { data, error } = await supabase
      .from('transactions' as any)
      .select('email');
    
    if (error) {
      toast({
        description: "Erro ao exportar",
        variant: "destructive",
      });
      return;
    }
    
    if (!data || data.length === 0) {
      toast({
        description: "Nenhum cliente encontrado",
      });
      return;
    }
    
    const emails = (data as any[]).map((t: any) => t.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emails_todos_clientes.txt`;
    link.click();
    
    toast({
      description: `${data.length} emails exportados`,
    });
  };

  const handleClearMetrics = async () => {
    const confirmClear = window.confirm(
      "Tem certeza que deseja limpar todas as métricas e transações? Um backup será criado automaticamente antes de limpar."
    );
    
    if (!confirmClear) return;

    try {
      // 1. Fazer backup antes de deletar (se habilitado)
      if (backupsAvailable) {
        try {
          const { data: transactionsData, error: fetchError } = await supabase
            .from('transactions' as any)
            .select('*');
          
          if (fetchError) {
            throw fetchError;
          }

          const backupData = {
            transactions: transactionsData || [],
            backup_date: new Date().toISOString(),
            transaction_count: transactionsData?.length || 0
          };

          const { error: backupError } = await supabase
            .from('backups' as any)
            .insert({
              name: `Backup Automático - ${new Date().toLocaleString('pt-BR')}`,
              data: backupData,
              description: `Backup automático antes de limpar métricas. ${transactionsData?.length || 0} transações.`
            } as any);

          if (backupError) {
            const message = `${backupError.message || ''}`.toLowerCase();
            const details = `${backupError.details || ''}`.toLowerCase();
            if (
              backupError.code === 'PGRST116' ||
              message.includes('backups') ||
              details.includes('backups') ||
              message.includes('does not exist')
            ) {
              setBackupsAvailable(false);
              toast({
                description: "Tabela de backups não encontrada. Desativando backups automáticos.",
              });
            } else {
              toast({
                description: "Erro ao criar backup, continuando limpeza.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              description: "Backup criado com sucesso!",
            });
          }
        } catch (backupError: any) {
          const message = `${backupError?.message || ''}`.toLowerCase();
          if (message.includes('backups') || message.includes('does not exist')) {
            setBackupsAvailable(false);
            toast({
              description: "Tabela de backups não existe. Backups automáticos desativados.",
            });
          } else {
            toast({
              description: "Erro ao criar backup, continuando limpeza.",
              variant: "destructive",
            });
          }
        }
      }

      // 2. Remover referências em blocked_ips (evita violar FK)
      const { error: blockedError } = await supabase
        .from('blocked_ips' as any)
        .delete()
        .not('transaction_id', 'is', null as any);

      if (blockedError) {
        const blockedMsg = `${blockedError.message || ''}`.toLowerCase();
        const blockedDetails = `${blockedError.details || ''}`.toLowerCase();
        // Ignorar se a tabela não existir
        if (
          blockedError.code !== 'PGRST116' &&
          !blockedMsg.includes('blocked_ips') &&
          !blockedDetails.includes('blocked_ips') &&
          !blockedMsg.includes('does not exist')
        ) {
          console.error('Erro ao remover blocked_ips:', blockedError);
          toast({
            description: blockedError.message || "Erro ao limpar IPs bloqueados.",
            variant: "destructive",
          });
          return;
        }
      }

      // 3. Deletar todas as transações em uma única chamada
      const { error: deleteError, count } = await supabase
        .from('transactions' as any)
        .delete({ count: 'exact' } as any)
        .not('id', 'is', null as any);
      
      if (deleteError) {
        console.error('Erro ao deletar transações:', deleteError);
        toast({
          description: deleteError.message || "Erro ao deletar transações. Verifique as permissões no Supabase.",
          variant: "destructive",
        });
        return;
      }

      await loadTransactions();
      toast({
        description: `${count ?? 0} transações deletadas com sucesso!`,
      });
    } catch (error: any) {
      toast({
        description: error.message || "Erro ao limpar métricas",
        variant: "destructive",
      });
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!backupsAvailable) {
      toast({
        description: "Funcionalidade de backup indisponível neste projeto.",
        variant: "destructive",
      });
      return;
    }
    const confirmRestore = window.confirm(
      "Tem certeza que deseja restaurar este backup? Todas as transações atuais serão substituídas."
    );
    
    if (!confirmRestore) return;

    try {
      // Buscar backup
      const { data: backup, error: fetchError } = await supabase
        .from('backups' as any)
        .select('*')
        .eq('id', backupId)
        .single();

      if (fetchError || !backup) {
        toast({
          description: "Erro ao buscar backup",
          variant: "destructive",
        });
        return;
      }

      const backupData = backup.data;
      
      if (!backupData.transactions || backupData.transactions.length === 0) {
        toast({
          description: "Backup vazio",
          variant: "destructive",
        });
        return;
      }

      // Limpar transações atuais
      const { data: currentTransactions } = await supabase
        .from('transactions' as any)
        .select('id');
      
      if (currentTransactions && currentTransactions.length > 0) {
        const ids = currentTransactions.map((t: any) => t.id);
        for (let i = 0; i < ids.length; i += 100) {
          const batch = ids.slice(i, i + 100);
          await supabase
            .from('transactions' as any)
            .delete()
            .in('id', batch);
        }
      }

      // Restaurar transações do backup
      // Remover campos que não devem ser restaurados
      const transactionsToRestore = backupData.transactions.map((t: any) => {
        const { id, created_at, updated_at, ...rest } = t;
        return rest;
      });

      const { error: restoreError } = await supabase
        .from('transactions' as any)
        .insert(transactionsToRestore);

      if (restoreError) {
        toast({
          description: "Erro ao restaurar backup",
        variant: "destructive",
      });
      return;
    }
    
      // Atualizar data de restauração
      await supabase
        .from('backups' as any)
        .update({ restored_at: new Date().toISOString() } as any)
        .eq('id', backupId);
    
    // Reload transactions
    await loadTransactions();
    
    toast({
        description: `Backup restaurado! ${backupData.transactions.length} transações recuperadas.`,
      });
    } catch (error: any) {
      toast({
        description: error.message || "Erro ao restaurar backup",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-gray-900 border-gray-800 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
            Painel Administrativo
          </h1>
            <p className="text-gray-400 text-sm">Acesse com suas credenciais</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuário
              </label>
              <input
                type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
            >
              Entrar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar loading enquanto carrega dados
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Banner de erro se houver problema ao carregar */}
      {loadError && (
        <div className="bg-yellow-900/50 border-b border-yellow-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-yellow-300 text-sm">{loadError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-yellow-400 hover:text-yellow-300 text-sm underline"
            >
              Atualizar página
            </button>
          </div>
        </div>
      )}
      <div className="flex h-screen">
        {/* Sidebar Esquerdo */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white mb-1">
              Painel Admin
          </h1>
            <p className="text-gray-400 text-xs">Gerencie seu site</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("upsells")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "upsells"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upsells
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "transactions"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Transações
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "settings"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </button>
            <button
              onClick={() => setActiveTab("fields")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "fields"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Campos
            </button>
            <button
              onClick={() => setActiveTab("pixels")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "pixels"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Pixels
            </button>
            <button
              onClick={() => setActiveTab("export")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "export"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "security"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Segurança
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "payment"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pagamento
            </button>
          </div>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-800">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            Sair
          </Button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="hidden">
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="upsells"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Upsells
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Transações
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Configurações
            </TabsTrigger>
            <TabsTrigger 
              value="fields"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Campos
            </TabsTrigger>
            <TabsTrigger 
              value="pixels"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Pixels
            </TabsTrigger>
            <TabsTrigger 
              value="export"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Exportar
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Segurança
            </TabsTrigger>
            <TabsTrigger 
              value="payment"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Pagamento
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardTab 
              stats={dashboardStats} 
              transactions={transactions}
              onClearMetrics={handleClearMetrics}
              onRestoreBackup={backupsAvailable ? handleRestoreBackup : undefined}
              backupsAvailable={backupsAvailable}
              onRefresh={async () => {
                await Promise.all([
                  loadTransactions(),
                  loadUpsellConfig()
                ]);
                toast({
                  description: "Dados atualizados",
                });
              }}
            />
          </TabsContent>
          
          <TabsContent value="upsells">
            <UpsellsTab upsells={upsells} onUpsellsChange={setUpsells} />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionsTab transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
          
          <TabsContent value="fields">
            <FieldsConfigTab />
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          
          <TabsContent value="payment">
            <PaymentTab />
          </TabsContent>
          
          <TabsContent value="pixels">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">
                Configuração de Pixels
              </h2>
              <div className="space-y-4">
                <div className="space-y-3 pb-4 border-b border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300">Facebook Pixel</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pixel ID
                    </label>
                    <input
                      type="text"
                      value={facebookPixelId}
                      onChange={(e) => setFacebookPixelId(e.target.value)}
                      placeholder="832420726397594"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token de Acesso
                    </label>
                    <input
                      type="text"
                      value={facebookToken}
                      onChange={(e) => setFacebookToken(e.target.value)}
                      placeholder="Cole seu token de acesso aqui"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="checkout"
                      checked={pixelOnCheckout}
                      onCheckedChange={(checked) => setPixelOnCheckout(checked as boolean)}
                    />
                    <label htmlFor="checkout" className="text-sm text-gray-300">
                      Disparar pixel no início do checkout
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="purchase"
                      checked={pixelOnPurchase}
                      onCheckedChange={(checked) => setPixelOnPurchase(checked as boolean)}
                    />
                    <label htmlFor="purchase" className="text-sm text-gray-300">
                      Disparar pixel após compra concluída
                    </label>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300">TikTok Pixel</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pixel ID
                    </label>
                    <input
                      type="text"
                      value={tiktokPixelId}
                      onChange={(e) => setTiktokPixelId(e.target.value)}
                      placeholder="Cole o ID do pixel TikTok"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token de Acesso
                    </label>
                    <input
                      type="text"
                      value={tiktokAccessToken}
                      onChange={(e) => setTiktokAccessToken(e.target.value)}
                      placeholder="Cole o token do Events API"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiktok-viewcontent"
                        checked={tiktokTrackViewContent}
                        onCheckedChange={(checked) => setTiktokTrackViewContent(checked as boolean)}
                      />
                      <label htmlFor="tiktok-viewcontent" className="text-sm text-gray-300">
                        Disparar ViewContent
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiktok-addtocart"
                        checked={tiktokTrackAddToCart}
                        onCheckedChange={(checked) => setTiktokTrackAddToCart(checked as boolean)}
                      />
                      <label htmlFor="tiktok-addtocart" className="text-sm text-gray-300">
                        Disparar AddToCart
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiktok-checkout"
                        checked={tiktokTrackCheckout}
                        onCheckedChange={(checked) => setTiktokTrackCheckout(checked as boolean)}
                      />
                      <label htmlFor="tiktok-checkout" className="text-sm text-gray-300">
                        Disparar InitiateCheckout
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiktok-purchase"
                        checked={tiktokTrackPurchase}
                        onCheckedChange={(checked) => setTiktokTrackPurchase(checked as boolean)}
                      />
                      <label htmlFor="tiktok-purchase" className="text-sm text-gray-300">
                        Disparar Purchase
                      </label>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={savePixelConfig} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Salvar Configurações
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="export">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                Exportar Relatórios
              </h2>
              
              {/* Filtros de Data */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-300">Filtrar por Período</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mês
                    </label>
                    <select
                      id="export-month"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="1">Janeiro</option>
                      <option value="2">Fevereiro</option>
                      <option value="3">Março</option>
                      <option value="4">Abril</option>
                      <option value="5">Maio</option>
                      <option value="6">Junho</option>
                      <option value="7">Julho</option>
                      <option value="8">Agosto</option>
                      <option value="9">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ano
                    </label>
                    <input
                      type="number"
                      id="export-year"
                      defaultValue={new Date().getFullYear()}
                      min="2020"
                      max="2100"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Exportação */}
              <div className="space-y-3">
                <Button 
                  onClick={exportTransactionsByPeriod} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Transações do Período
                </Button>
                
                <Button 
                  onClick={exportPaidEmails} 
                  className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Emails - Clientes Pagos
                </Button>
                
                <Button 
                  onClick={exportAllEmails} 
                  className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Emails - Todos os Clientes
                </Button>
              </div>
            </Card>
          </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Chat Bot */}
        <ChatBot />
      </div>
    </div>
  );
};

export default Admin;
