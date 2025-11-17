import { useState } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, Wrench, Plus, Check } from "lucide-react";

interface UpsellOfferProps {
  title?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  imageUrl?: string;
  onToggle?: (added: boolean) => void;
  buttonClassName?: string;
}

export const UpsellOffer = ({ 
  title = "⚠️ Manutenção em Andamento",
  description = "Estamos realizando melhorias no sistema. Esta oferta estará disponível em breve. Agradecemos sua compreensão.",
  price = "197,00",
  originalPrice = "297,00",
  imageUrl,
  onToggle,
  buttonClassName
}: UpsellOfferProps) => {
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleToggle = () => {
    const newAdded = !added;
    setAdded(newAdded);
    onToggle?.(newAdded);
  };

  // Se não tiver imagem, mostrar modo de manutenção
  const isMaintenanceMode = !imageUrl || imageUrl.trim() === '';

  return (
    <div className={`${isMaintenanceMode 
      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600' 
      : 'bg-card border border-border'
    } rounded-xl p-5 mb-4 shadow-lg`}>
      <div className="flex gap-4 mb-3">
        {/* Imagem ou Ícone de manutenção */}
        {isMaintenanceMode ? (
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400 dark:bg-yellow-600 rounded-full flex items-center justify-center">
            <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-900 dark:text-yellow-100" />
          </div>
        ) : (
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted">
            {!imageError ? (
              <img 
                src={imageUrl} 
                alt={title || 'Produto'}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
        
        {/* Descrição do lado */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isMaintenanceMode && (
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            )}
            <h3 className={`text-base font-bold ${
              isMaintenanceMode 
                ? 'text-yellow-900 dark:text-yellow-100' 
                : 'text-foreground'
            }`}>
              {title}
            </h3>
          </div>
          <p className={`text-sm leading-relaxed ${
            isMaintenanceMode 
              ? 'text-yellow-800 dark:text-yellow-200' 
              : 'text-muted-foreground'
          }`}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Valor e botão embaixo */}
      <div className={`flex items-center justify-between pt-3 border-t ${
        isMaintenanceMode 
          ? 'border-yellow-300 dark:border-yellow-700' 
          : 'border-border'
      }`}>
        <div>
          <p className={`text-xl font-bold ${
            isMaintenanceMode 
              ? 'text-yellow-900 dark:text-yellow-100' 
              : 'text-foreground'
          }`}>
            R$ {price}
          </p>
          {originalPrice && (
            <p className={`text-sm line-through ${
              isMaintenanceMode 
                ? 'text-yellow-700 dark:text-yellow-300' 
                : 'text-muted-foreground'
            }`}>
              R$ {originalPrice}
            </p>
          )}
        </div>
        <Button
          onClick={handleToggle}
          variant={added ? "secondary" : "default"}
          size="sm"
          className={buttonClassName || (isMaintenanceMode 
            ? "rounded-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900" 
            : "rounded-full")}
          disabled={isMaintenanceMode}
        >
          {isMaintenanceMode ? (
            'Indisponível'
          ) : added ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Adicionado
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
