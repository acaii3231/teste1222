import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/InputField";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { Gift, Percent, DollarSign } from "lucide-react";

export function BlackFridayTab() {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [productPrice, setProductPrice] = useState("67.00");
  const [discountPrice, setDiscountPrice] = useState("47.00");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar configurações
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_config' as any)
          .select('*')
          .in('key', ['black_friday_active', 'black_friday_product_price', 'black_friday_discount_price']);

        if (error) {
          console.error('Erro ao carregar configurações:', error);
          return;
        }

        if (data) {
          (data as any[]).forEach((config: any) => {
            if (config.key === 'black_friday_active') {
              setIsActive(config.value === 'true');
            } else if (config.key === 'black_friday_product_price') {
              setProductPrice(config.value || '67.00');
            } else if (config.key === 'black_friday_discount_price') {
              setDiscountPrice(config.value || '47.00');
            }
          });
        }

        // Calcular desconto inicial
        calculateDiscount();
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadConfig();
  }, []);

  // Calcular percentual de desconto
  const calculateDiscount = () => {
    const original = parseFloat(productPrice.replace(',', '.')) || 0;
    const discount = parseFloat(discountPrice.replace(',', '.')) || 0;
    
    if (original > 0 && discount > 0 && discount < original) {
      const percent = ((original - discount) / original) * 100;
      setDiscountPercent(Math.round(percent));
    } else {
      setDiscountPercent(0);
    }
  };

  // Recalcular quando os valores mudarem
  useEffect(() => {
    calculateDiscount();
  }, [productPrice, discountPrice]);

  // Salvar configurações
  const saveConfig = async () => {
    setSaving(true);
    try {
      const configs = [
        { key: 'black_friday_active', value: String(isActive) },
        { key: 'black_friday_product_price', value: productPrice },
        { key: 'black_friday_discount_price', value: discountPrice },
      ];

      // Usar upsert para cada configuração
      const promises = configs.map(config =>
        supabase
          .from('site_config' as any)
          .upsert({ key: config.key, value: config.value }, { onConflict: 'key' })
      );

      await Promise.all(promises);

      toast({
        title: "✅ Configurações salvas!",
        description: "As configurações da Black Friday foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Black Friday</h2>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="space-y-6">
          {/* Ativar/Desativar */}
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox
                id="black-friday-active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
                className="border-gray-600"
              />
              <label
                htmlFor="black-friday-active"
                className="text-white font-medium cursor-pointer"
              >
                Ativar Black Friday
              </label>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isActive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {isActive ? 'Ativo' : 'Inativo'}
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor Original */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor Original do Produto (R$)
              </label>
              <InputField
                type="text"
                value={productPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, '');
                  setProductPrice(value);
                }}
                placeholder="67.00"
                className="bg-gray-900 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Valor normal do produto
              </p>
            </div>

            {/* Valor com Desconto */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Gift className="w-4 h-4 inline mr-1" />
                Valor com Desconto (R$)
              </label>
              <InputField
                type="text"
                value={discountPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, '');
                  setDiscountPrice(value);
                }}
                placeholder="47.00"
                className="bg-gray-900 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Valor promocional da Black Friday
              </p>
            </div>
          </div>

          {/* Percentual de Desconto Calculado */}
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 font-medium">Desconto Calculado:</span>
              </div>
              <span className="text-2xl font-bold text-purple-400">
                {discountPercent}%
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              De R$ {productPrice} por R$ {discountPrice}
            </div>
          </div>

          {/* Informações */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">
              ℹ️ Como funciona:
            </h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Quando ativado, os usuários verão uma roleta ao entrar no checkout</li>
              <li>• Eles podem ganhar o desconto da Black Friday</li>
              <li>• Se ganharem, o valor do produto será alterado automaticamente</li>
              <li>• A roleta aparece apenas uma vez por sessão</li>
            </ul>
          </div>

          {/* Botão Salvar */}
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? 'Salvando...' : '💾 Salvar Configurações'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

