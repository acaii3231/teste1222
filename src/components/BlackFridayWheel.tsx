import { useState, useEffect } from "react";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlackFridayWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onWin: () => void;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
}

export function BlackFridayWheel({
  isOpen,
  onClose,
  onWin,
  originalPrice,
  discountPrice,
  discountPercent,
}: BlackFridayWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Verificar se já jogou nesta sessão
  useEffect(() => {
    if (isOpen && localStorage.getItem('black_friday_played')) {
      // Já jogou, fechar automaticamente
      const hasWon = localStorage.getItem('black_friday_won') === 'true';
      if (hasWon) {
        // Se ganhou, aplicar desconto e fechar
        onWin();
      }
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [isOpen, onClose, onWin]);

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    
    // Probabilidade de ganhar: 70% (pode ajustar)
    const winChance = 0.7;
    const hasWon = Math.random() < winChance;

    // Rotação aleatória (múltiplos de 360 para várias voltas)
    const spins = 5 + Math.random() * 3; // 5-8 voltas
    const finalRotation = rotation + (spins * 360) + (hasWon ? 0 : 180); // Se perder, para em posição diferente

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      if (hasWon) {
        setWon(true);
        localStorage.setItem('black_friday_played', 'true');
        localStorage.setItem('black_friday_won', 'true');
      } else {
        localStorage.setItem('black_friday_played', 'true');
        localStorage.setItem('black_friday_won', 'false');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }, 3000); // Duração da animação
  };

  const handleClaimDiscount = () => {
    onWin();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-purple-500">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!won && !spinning && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Gift className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                🎉 Black Friday Especial!
              </h2>
              <p className="text-purple-200 text-lg">
                Gire a roleta e ganhe <span className="font-bold text-yellow-300">{discountPercent}% OFF</span>
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <p className="text-white/80 text-sm mb-2">De:</p>
              <p className="text-gray-300 line-through text-xl">R$ {originalPrice.toFixed(2).replace('.', ',')}</p>
              <p className="text-white/80 text-sm mt-2 mb-2">Por apenas:</p>
              <p className="text-yellow-300 text-3xl font-bold">R$ {discountPrice.toFixed(2).replace('.', ',')}</p>
            </div>

            {/* Roleta Visual */}
            <div className="relative w-64 h-64 mx-auto">
              <div
                className="w-full h-full rounded-full border-8 border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center transition-transform duration-3000 ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-xl">
                  <Gift className="w-24 h-24 text-white" />
                </div>
              </div>
              {/* Seta indicadora */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-purple-400"></div>
              </div>
            </div>

            <Button
              onClick={spinWheel}
              disabled={spinning}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-lg"
            >
              {spinning ? 'Girando...' : '🎰 GIRAR A ROLETA'}
            </Button>
          </div>
        )}

        {spinning && (
          <div className="text-center space-y-6">
            <div className="relative w-64 h-64 mx-auto">
              <div
                className="w-full h-full rounded-full border-8 border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center transition-transform duration-3000 ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-xl">
                  <Gift className="w-24 h-24 text-white animate-spin" />
                </div>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-purple-400"></div>
              </div>
            </div>
            <p className="text-white text-xl font-bold animate-pulse">
              🎰 Girando...
            </p>
          </div>
        )}

        {won && (
          <div className="text-center space-y-6 animate-bounce">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Gift className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-yellow-300 mb-2 animate-pulse">
                🎉 PARABÉNS!
              </h2>
              <p className="text-white text-xl mb-4">
                Você ganhou <span className="font-bold text-yellow-300">{discountPercent}% OFF</span>!
              </p>
            </div>

            <div className="bg-white/20 rounded-lg p-6 backdrop-blur">
              <p className="text-white/80 text-sm mb-2">De:</p>
              <p className="text-gray-300 line-through text-xl">R$ {originalPrice.toFixed(2).replace('.', ',')}</p>
              <p className="text-white/80 text-sm mt-4 mb-2">Por apenas:</p>
              <p className="text-yellow-300 text-4xl font-bold">R$ {discountPrice.toFixed(2).replace('.', ',')}</p>
            </div>

            <Button
              onClick={handleClaimDiscount}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 text-lg shadow-lg"
            >
              🎁 PEGAR PROMOÇÃO
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

