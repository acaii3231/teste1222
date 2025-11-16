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

// Segmentos da roleta com percentuais de desconto
const WHEEL_SEGMENTS = [
  { percent: 2, label: "2%" },
  { percent: 3, label: "3%" },
  { percent: 5, label: "5%" },
  { percent: 10, label: "10%" },
  { percent: 15, label: "15%" },
  { percent: 25, label: "25%" },
  { percent: 50, label: "50%" },
  { percent: 100, label: "100%" },
];

const SEGMENT_COUNT = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

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
  const [winningSegment, setWinningSegment] = useState<number | null>(null);
  const [finalRotation, setFinalRotation] = useState(0);

  // Verificar se já jogou nesta sessão
  useEffect(() => {
    if (isOpen && localStorage.getItem('black_friday_played')) {
      const hasWon = localStorage.getItem('black_friday_won') === 'true';
      if (hasWon) {
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
    setWon(false);
    setWinningSegment(null);
    
    // Probabilidade de ganhar: 70%
    const winChance = 0.7;
    const hasWon = Math.random() < winChance;

    // Selecionar segmento ganhador (se ganhou, escolher um aleatório)
    let selectedSegment = 0;
    if (hasWon) {
      // Encontrar o segmento mais próximo do desconto configurado
      const targetPercent = discountPercent;
      let closestIndex = 0;
      let closestDiff = Math.abs(WHEEL_SEGMENTS[0].percent - targetPercent);
      
      for (let i = 1; i < WHEEL_SEGMENTS.length; i++) {
        const diff = Math.abs(WHEEL_SEGMENTS[i].percent - targetPercent);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = i;
        }
      }
      
      // 80% de chance de parar no segmento mais próximo, 20% em um aleatório menor
      if (Math.random() < 0.8) {
        selectedSegment = closestIndex;
      } else {
        // Escolher um segmento aleatório (tendendo para os menores)
        const weights = [0.20, 0.20, 0.20, 0.15, 0.10, 0.08, 0.05, 0.02];
        const random = Math.random();
        let cumulative = 0;
        for (let i = 0; i < weights.length; i++) {
          cumulative += weights[i];
          if (random <= cumulative) {
            selectedSegment = i;
            break;
          }
        }
      }
    } else {
      // Se não ganhou, parar em um segmento aleatório
      selectedSegment = Math.floor(Math.random() * SEGMENT_COUNT);
    }

    // Calcular rotação final
    // Múltiplas voltas (5-8 voltas) + posição do segmento
    const spins = 5 + Math.random() * 3;
    const segmentCenterAngle = selectedSegment * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    // Adicionar 360 graus para garantir que pare no segmento correto
    const targetRotation = rotation + (spins * 360) + (360 - segmentCenterAngle);
    
    setFinalRotation(targetRotation);
    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      if (hasWon) {
        setWon(true);
        setWinningSegment(selectedSegment);
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

  // Gerar SVG da roleta
  const generateWheelSVG = () => {
    const size = 400;
    const center = size / 2;
    const radius = size / 2 - 20;
    const segments: JSX.Element[] = [];

    WHEEL_SEGMENTS.forEach((segment, index) => {
      const startAngle = (index * SEGMENT_ANGLE - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
      
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      const isWinning = winningSegment === index && won;
      const fillColor = isWinning ? '#00C853' : index % 2 === 0 ? '#000000' : '#1a1a1a';
      const textColor = isWinning ? '#FFFFFF' : '#FFFFFF';
      const strokeColor = isWinning ? '#00C853' : '#333333';

      // Posição do texto no centro do segmento
      const textAngle = (index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 - 90) * (Math.PI / 180);
      const textRadius = radius * 0.7;
      const textX = center + textRadius * Math.cos(textAngle);
      const textY = center + textRadius * Math.sin(textAngle);

      segments.push(
        <g key={index}>
          <path
            d={pathData}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={isWinning ? "3" : "1"}
            style={{
              filter: isWinning ? 'drop-shadow(0 4px 8px rgba(0, 200, 83, 0.4))' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fontSize="20"
            fontWeight="600"
            style={{
              filter: isWinning ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' : 'none',
            }}
          >
            {segment.label}
          </text>
        </g>
      );
    });

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
      >
        {segments}
        {/* Centro da roleta */}
        <circle
          cx={center}
          cy={center}
          r={60}
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1px"
        >
          PROMOÇÃO
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1px"
        >
          ROLETA DE
        </text>
        <text
          x={center}
          y={center + 25}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1px"
        >
          DESCONTO
        </text>
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border-2 border-gray-200">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!won && !spinning && (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">
                ROLETA DE DESCONTO
              </h2>
              <p className="text-gray-600 text-sm">
                Gire a roleta e ganhe um desconto especial!
              </p>
            </div>

            {/* Roleta SVG */}
            <div className="flex justify-center items-center relative">
              <div className="relative">
                {generateWheelSVG()}
                {/* Seta indicadora fixa */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[25px] border-l-transparent border-r-transparent border-t-black"></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-700 text-sm mb-2">Valor original:</p>
              <p className="text-gray-400 line-through text-lg">R$ {originalPrice.toFixed(2).replace('.', ',')}</p>
            </div>

            <Button
              onClick={spinWheel}
              disabled={spinning}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 text-lg shadow-lg transition-all"
            >
              {spinning ? 'Girando...' : 'GIRAR ROLETA'}
            </Button>
          </div>
        )}

        {spinning && (
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center relative">
              <div className="relative">
                {generateWheelSVG()}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[25px] border-l-transparent border-r-transparent border-t-black"></div>
                </div>
              </div>
            </div>
            <p className="text-black text-xl font-bold">
              🎰 Girando...
            </p>
          </div>
        )}

        {won && winningSegment !== null && (
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center relative">
              <div className="relative">
                {generateWheelSVG()}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[25px] border-l-transparent border-r-transparent border-t-black"></div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-black mb-2">
                PARABÉNS!
              </h2>
              <p className="text-gray-600 text-xl mb-4">
                Você ganhou <span className="font-bold text-green-600">{discountPercent}%</span> de desconto!
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-gray-600 text-sm mb-2">De:</p>
              <p className="text-gray-400 line-through text-xl">R$ {originalPrice.toFixed(2).replace('.', ',')}</p>
              <p className="text-gray-600 text-sm mt-4 mb-2">Por apenas:</p>
              <p className="text-black text-4xl font-bold">R$ {discountPrice.toFixed(2).replace('.', ',')}</p>
            </div>

            <Button
              onClick={handleClaimDiscount}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg shadow-lg transition-all"
            >
              PEGAR PROMOÇÃO
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
