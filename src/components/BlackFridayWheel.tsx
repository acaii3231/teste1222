import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
  { percent: 25, label: "25%" },
  { percent: 50, label: "50%" },
  { percent: 75, label: "75%" },
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

  // Verificar se já jogou nesta sessão
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && localStorage.getItem('black_friday_played')) {
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

    // Selecionar segmento ganhador
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
      
      // 80% de chance de parar no segmento mais próximo
      if (Math.random() < 0.8) {
        selectedSegment = closestIndex;
      } else {
        // Escolher um segmento aleatório (tendendo para os menores)
        const weights = [0.25, 0.25, 0.20, 0.15, 0.08, 0.04, 0.02, 0.01];
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
    const spins = 5 + Math.random() * 3; // 5-8 voltas
    const segmentCenterAngle = selectedSegment * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const currentRotation = rotation;
    const targetRotation = currentRotation + (spins * 360) + (360 - segmentCenterAngle);
    
    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      if (hasWon) {
        setWon(true);
        setWinningSegment(selectedSegment);
        if (typeof window !== 'undefined') {
          localStorage.setItem('black_friday_played', 'true');
          localStorage.setItem('black_friday_won', 'true');
        }
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('black_friday_played', 'true');
          localStorage.setItem('black_friday_won', 'false');
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }, 3000);
  };

  const handleClaimDiscount = () => {
    onWin();
    onClose();
  };

  // Gerar paths dos segmentos (8 segmentos)
  const generateSegmentPath = (index: number): string => {
    const startAngle = (index * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const radius = 100;
    
    const x1 = radius * Math.cos(startAngle);
    const y1 = radius * Math.sin(startAngle);
    const x2 = radius * Math.cos(endAngle);
    const y2 = radius * Math.sin(endAngle);
    
    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
    
    return `M0,0 L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
  };

  // Posição do texto no segmento
  const getTextPosition = (index: number): { x: number; y: number } => {
    const angle = (index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 - 90) * (Math.PI / 180);
    const radius = 60;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          type="button"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        {!won && !spinning && (
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                ROLETA DE DESCONTO
              </h2>
              <p className="text-gray-600 text-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Gire a roleta e ganhe um desconto especial!
              </p>
            </div>

            {/* Roleta SVG */}
            <div 
              className="flex justify-center items-center relative mx-auto" 
              style={{ width: '360px', height: '360px', maxWidth: '100%' }}
            >
              {/* Seta indicadora fixa */}
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                  transform: 'translate(-50%, -100%)',
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '18px solid #0a0a0a',
                  zIndex: 10,
                }}
                aria-hidden="true"
              />
              
              <svg
                viewBox="-100 -100 200 200"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
                role="img"
                aria-label="Roleta de desconto"
              >
                {/* Segmentos */}
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const isActive = winningSegment === index && won;
                  const isOdd = index % 2 === 0;
                  const textPos = getTextPosition(index);
                  
                  return (
                    <g key={`segment-${index}`}>
                      <path
                        d={generateSegmentPath(index)}
                        className={`segment ${isOdd ? 'odd' : 'even'} ${isActive ? 'active' : ''}`}
                        data-value={segment.label}
                        style={{
                          stroke: '#0a0a0a',
                          strokeWidth: 2,
                          fill: isActive ? '#00C853' : (isOdd ? '#f7f7f7' : '#ffffff'),
                          transition: 'fill 250ms ease, transform 250ms ease, filter 250ms ease',
                          transformOrigin: 'center',
                          transform: isActive ? 'scale(1.03)' : 'scale(1)',
                          filter: isActive ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.12))' : 'none',
                        }}
                      />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        className="seg-label"
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          fill: isActive ? '#ffffff' : '#0a0a0a',
                          textAnchor: 'middle',
                          pointerEvents: 'none',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {segment.label}
                      </text>
                    </g>
                  );
                })}

                {/* Círculo central */}
                <circle
                  cx="0"
                  cy="0"
                  r="35"
                  style={{
                    fill: '#f1f1f1',
                    stroke: '#0a0a0a',
                    strokeWidth: 2,
                  }}
                />
                <text
                  x="0"
                  y="-4"
                  className="center-title"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    fill: '#0a0a0a',
                    textAnchor: 'middle',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  PROMOÇÃO
                </text>
                <text
                  x="0"
                  y="12"
                  className="center-sub"
                  style={{
                    fontSize: '11px',
                    fill: '#0a0a0a',
                    textAnchor: 'middle',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  ROLETA DE DESCONTO
                </text>
              </svg>
            </div>

            <div className="bg-gray-100 rounded-lg p-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <p className="text-gray-700 text-sm mb-2">Valor original:</p>
              <p className="text-gray-400 line-through text-lg">R$ {originalPrice.toFixed(2).replace('.', ',')}</p>
            </div>

            <Button
              onClick={spinWheel}
              disabled={spinning}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 text-lg shadow-lg transition-all"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              type="button"
            >
              {spinning ? 'Girando...' : 'GIRAR ROLETA'}
            </Button>
          </div>
        )}

        {spinning && (
          <div className="text-center space-y-6">
            <div 
              className="flex justify-center items-center relative mx-auto" 
              style={{ width: '360px', height: '360px', maxWidth: '100%' }}
            >
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                  transform: 'translate(-50%, -100%)',
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '18px solid #0a0a0a',
                  zIndex: 10,
                }}
                aria-hidden="true"
              />
              <svg
                viewBox="-100 -100 200 200"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                }}
                role="img"
                aria-label="Roleta girando"
              >
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const isOdd = index % 2 === 0;
                  const textPos = getTextPosition(index);
                  
                  return (
                    <g key={`segment-spin-${index}`}>
                      <path
                        d={generateSegmentPath(index)}
                        style={{
                          stroke: '#0a0a0a',
                          strokeWidth: 2,
                          fill: isOdd ? '#f7f7f7' : '#ffffff',
                        }}
                      />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          fill: '#0a0a0a',
                          textAnchor: 'middle',
                          pointerEvents: 'none',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {segment.label}
                      </text>
                    </g>
                  );
                })}
                <circle
                  cx="0"
                  cy="0"
                  r="35"
                  style={{
                    fill: '#f1f1f1',
                    stroke: '#0a0a0a',
                    strokeWidth: 2,
                  }}
                />
                <text
                  x="0"
                  y="-4"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    fill: '#0a0a0a',
                    textAnchor: 'middle',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  PROMOÇÃO
                </text>
                <text
                  x="0"
                  y="12"
                  style={{
                    fontSize: '11px',
                    fill: '#0a0a0a',
                    textAnchor: 'middle',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  ROLETA DE DESCONTO
                </text>
              </svg>
            </div>
            <p className="text-black text-xl font-bold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              🎰 Girando...
            </p>
          </div>
        )}

        {won && winningSegment !== null && (
          <div className="text-center space-y-6">
            <div 
              className="flex justify-center items-center relative mx-auto" 
              style={{ width: '360px', height: '360px', maxWidth: '100%' }}
            >
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                  transform: 'translate(-50%, -100%)',
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '18px solid #0a0a0a',
                  zIndex: 10,
                }}
                aria-hidden="true"
              />
              <svg
                viewBox="-100 -100 200 200"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  transform: `rotate(${rotation}deg)`,
                }}
                role="img"
                aria-label="Roleta - resultado"
              >
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const isActive = winningSegment === index;
                  const isOdd = index % 2 === 0;
                  const textPos = getTextPosition(index);
                  
                  return (
                    <g key={`segment-won-${index}`}>
                      <path
                        d={generateSegmentPath(index)}
                        style={{
                          stroke: '#0a0a0a',
                          strokeWidth: 2,
                          fill: isActive ? '#00C853' : (isOdd ? '#f7f7f7' : '#ffffff'),
                          transition: 'fill 250ms ease, transform 250ms ease, filter 250ms ease',
                          transformOrigin: 'center',
                          transform: isActive ? 'scale(1.03)' : 'scale(1)',
                          filter: isActive ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.12))' : 'none',
                        }}
                      />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          fill: isActive ? '#ffffff' : '#0a0a0a',
                          textAnchor: 'middle',
                          pointerEvents: 'none',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                      >
                        {segment.label}
                      </text>
                    </g>
                  );
                })}
                <circle
                  cx="0"
                  cy="0"
                  r="35"
                  style={{
                    fill: '#f1f1f1',
                    stroke: '#0a0a0a',
                    strokeWidth: 2,
                  }}
                />
                <text
                  x="0"
                  y="-4"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    fill: '#0a0a0a',
                    textAnchor: 'middle',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  PROMOÇÃO
                </text>
                <text
                  x="0"
                  y="12"
                  style={{
                    fontSize: '11px',
                    fill: '#0a0a0a',
                    textAnchor: 'middle',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  ROLETA DE DESCONTO
                </text>
              </svg>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-black mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                PARABÉNS!
              </h2>
              <p className="text-gray-600 text-xl mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Você ganhou <span className="font-bold text-green-600">{discountPercent}%</span> de desconto!
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <p className="text-gray-600 text-sm mb-2">De:</p>
              <p className="text-gray-400 line-through text-xl">R$ {originalPrice.toFixed(2).replace('.', ',')}</p>
              <p className="text-gray-600 text-sm mt-4 mb-2">Por apenas:</p>
              <p className="text-black text-4xl font-bold">R$ {discountPrice.toFixed(2).replace('.', ',')}</p>
            </div>

            <Button
              onClick={handleClaimDiscount}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg shadow-lg transition-all"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              type="button"
            >
              PEGAR PROMOÇÃO
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
