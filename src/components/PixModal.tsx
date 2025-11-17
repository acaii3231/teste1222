import { X, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { checkPixStatus } from "@/lib/pix-api";

interface PixModalProps {
  qrCodeBase64: string;
  qrCode: string;
  onClose: () => void;
  paymentStatus?: string;
  isCheckingPayment?: boolean;
  pixId?: string;
}

// Detecção completa de dispositivos e navegadores
interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isXiaomi: boolean;
  isSamsung: boolean;
  isChrome: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isOpera: boolean;
  supportsClipboardAPI: boolean;
  supportsExecCommand: boolean;
}

const detectDevice = (): DeviceInfo => {
  const ua = navigator.userAgent.toLowerCase();
  
  // Detecção de mobile - múltiplos métodos
  const hasMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(ua);
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  const isMobile = hasMobileUA || (hasTouchScreen && isSmallScreen);
  
  // Detecção de plataformas
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  
  // Detecção de marcas Android
  const isXiaomi = /xiaomi|redmi|mi\s|poco|redmi/i.test(ua);
  const isSamsung = /samsung|galaxy|sm-|gt-|sgh-/i.test(ua);
  
  // Detecção de navegadores
  const isChrome = /chrome/i.test(ua) && !/edg|opr|safari/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome|edg|opr/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  const isEdge = /edg/i.test(ua);
  const isOpera = /opr|opera/i.test(ua);
  
  // Verificar suporte de APIs
  const supportsClipboardAPI = !!(navigator.clipboard && navigator.clipboard.writeText);
  const supportsExecCommand = !!document.execCommand;
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    isXiaomi,
    isSamsung,
    isChrome,
    isSafari,
    isFirefox,
    isEdge,
    isOpera,
    supportsClipboardAPI,
    supportsExecCommand,
  };
};

export const PixModal = ({ qrCodeBase64, qrCode, onClose, paymentStatus, isCheckingPayment = true, pixId }: PixModalProps) => {
  const [copied, setCopied] = useState(false);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(paymentStatus || 'pending');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  // Detectar dispositivo ao montar
  useEffect(() => {
    const device = detectDevice();
    setDeviceInfo(device);
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Dispositivo detectado:', {
        dispositivo: device.isXiaomi ? 'Xiaomi' : device.isSamsung ? 'Samsung' : device.isIOS ? 'iOS' : device.isAndroid ? 'Android' : 'Outro',
        navegador: device.isChrome ? 'Chrome' : device.isSafari ? 'Safari' : device.isFirefox ? 'Firefox' : device.isEdge ? 'Edge' : 'Outro',
        mobile: device.isMobile,
        clipboardAPI: device.supportsClipboardAPI,
        execCommand: device.supportsExecCommand,
      });
    }
  }, []);

  // Error boundary interno
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('Erro capturado no modal:', event.error);
      setError('Ocorreu um erro. Por favor, tente novamente.');
      event.preventDefault();
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  // Atualiza status local quando paymentStatus mudar
  useEffect(() => {
    if (paymentStatus) {
      setLocalPaymentStatus(paymentStatus);
    }
  }, [paymentStatus]);

  // Fecha automaticamente após 3 segundos quando pagamento confirmado
  useEffect(() => {
    if (localPaymentStatus === 'paid') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localPaymentStatus, onClose]);

  const checkPaymentStatus = async () => {
    if (!pixId) {
      alert('ID do PIX não encontrado');
      return;
    }
    
    setIsChecking(true);
    try {
      // Usar helper que funciona automaticamente em localhost e Vercel
      const data = await checkPixStatus(pixId);
      console.log('Status do pagamento:', data);

      const status = data.status || 'pending';
      
      if (status === 'paid') {
        setLocalPaymentStatus('paid');
      } else {
        alert('Ainda não foi identificado, tente novamente.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      alert('Erro ao verificar pagamento. Tente novamente.');
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevenir TODOS os comportamentos padrão de forma agressiva
    if (e) {
      try {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if (e.nativeEvent) {
          e.nativeEvent.stopImmediatePropagation?.();
          e.nativeEvent.preventDefault?.();
        }
      } catch (err) {
        // Ignorar erros de prevenção
      }
    }
    
    // Retornar false para garantir que nada aconteça
    if (!qrCode || qrCode.trim() === '') {
      return false;
    }
    
    // Usar requestAnimationFrame para garantir que está fora do ciclo de eventos
    requestAnimationFrame(() => {
      try {
        copyToClipboardInternal(qrCode);
      } catch (error) {
        console.error('Erro ao copiar:', error);
        copyToClipboardFallback(qrCode);
      }
    });
    
    return false;
  };

  const copyToClipboardInternal = (text: string) => {
    const device = deviceInfo || detectDevice();
    
    try {
      // Método 1: API moderna do clipboard (melhor para Chrome, Edge, Firefox moderno)
      if (device.supportsClipboardAPI && (device.isChrome || device.isEdge || device.isFirefox || window.isSecureContext)) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch((err) => {
          console.log('Clipboard API falhou, usando fallback:', err);
          // Se falhar, tentar método 2
          copyToClipboardFallback(text);
        });
        return;
      }
      
      // Método 2: Fallback para todos os outros casos
      copyToClipboardFallback(text);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      copyToClipboardFallback(text);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    const device = deviceInfo || detectDevice();
    
    try {
      // Usar textarea para textos longos (código PIX é longo)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Estilos otimizados para diferentes dispositivos
      if (device.isIOS) {
        // iOS precisa de posição específica
        textArea.style.position = 'absolute';
        textArea.style.left = '0';
        textArea.style.top = '0';
        textArea.style.width = '1px';
        textArea.style.height = '1px';
      } else if (device.isXiaomi || device.isSamsung) {
        // Xiaomi/Samsung - posição fixa funciona melhor
        textArea.style.position = 'fixed';
        textArea.style.left = '0';
        textArea.style.top = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
      } else {
        // Outros dispositivos
        textArea.style.position = 'fixed';
        textArea.style.left = '0';
        textArea.style.top = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
      }
      
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.style.zIndex = '-9999';
      textArea.setAttribute('readonly', 'readonly');
      textArea.setAttribute('aria-hidden', 'true');
      textArea.setAttribute('tabindex', '-1');
      
      document.body.appendChild(textArea);
      
      // Delay baseado no dispositivo
      const delay = device.isXiaomi ? 50 : device.isIOS ? 30 : 10;
      
      setTimeout(() => {
        try {
          // Métodos de seleção específicos por dispositivo
          if (device.isXiaomi) {
            // Xiaomi - método mais robusto
            textArea.focus();
            textArea.select();
            // Múltiplas tentativas
            setTimeout(() => {
              textArea.setSelectionRange(0, text.length);
              tryCopy(textArea, text);
            }, 20);
          } else if (device.isSamsung) {
            // Samsung
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, text.length);
            tryCopy(textArea, text);
          } else if (device.isIOS) {
            // iOS - usar Selection API
            const range = document.createRange();
            range.selectNodeContents(textArea);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
            textArea.setSelectionRange(0, text.length);
            tryCopy(textArea, text);
          } else if (device.isAndroid) {
            // Android genérico
            textArea.focus();
            textArea.select();
            try {
              textArea.setSelectionRange(0, text.length);
            } catch (e) {
              // Ignorar se não suportar
            }
            tryCopy(textArea, text);
          } else {
            // Desktop ou outros
            textArea.focus();
            textArea.select();
            tryCopy(textArea, text);
          }
        } catch (selectError) {
          console.error('Erro ao selecionar texto:', selectError);
          // Tentar remover mesmo em caso de erro
          cleanup(textArea);
        }
      }, delay);
    } catch (error) {
      console.error('Erro no fallback de cópia:', error);
    }
  };

  const tryCopy = (element: HTMLTextAreaElement, text: string, retries = 2) => {
    try {
      const successful = document.execCommand('copy');
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        cleanup(element);
      } else if (retries > 0) {
        // Retry com foco novamente
        setTimeout(() => {
          element.focus();
          element.select();
          element.setSelectionRange(0, text.length);
          tryCopy(element, text, retries - 1);
        }, 20);
      } else {
        // Última tentativa
        element.focus();
        element.select();
        const finalAttempt = document.execCommand('copy');
        if (finalAttempt) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        cleanup(element);
      }
    } catch (copyError) {
      console.error('Erro ao executar copy:', copyError);
      if (retries > 0) {
        setTimeout(() => tryCopy(element, text, retries - 1), 20);
      } else {
        cleanup(element);
      }
    }
  };

  const cleanup = (element: HTMLTextAreaElement) => {
    setTimeout(() => {
      try {
        if (element && element.parentNode) {
          document.body.removeChild(element);
        }
      } catch (removeError) {
        // Ignorar erro de remoção
      }
    }, 100);
  };

  // Se houver erro, mostrar mensagem de erro
  if (error) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
            setError(null);
          }
        }}
        style={{ touchAction: 'manipulation' }}
      >
        <div 
          className="bg-background rounded-2xl max-w-md w-full p-6 relative my-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Erro
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setError(null);
              }}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold transition-colors touch-manipulation"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se o pagamento foi confirmado, mostrar mensagem de sucesso
  if (localPaymentStatus === 'paid') {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div 
          className="bg-background rounded-2xl max-w-md w-full p-6 relative my-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation?.();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation?.();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation?.();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          style={{ touchAction: 'manipulation' }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Pagamento Confirmado! 🎉
            </h2>
            
            <p className="text-muted-foreground mb-2">
              Fique de olho no seu <strong className="text-foreground">WhatsApp</strong>!
            </p>
            <p className="text-muted-foreground mb-6">
              Entraremos em contato em breve para enviar seu produto.
            </p>
            
            <p className="text-sm text-muted-foreground">
              Muito obrigado pela sua compra! 💚
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-full mt-6 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors touch-manipulation"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          onClose();
        }
      }}
      onTouchStart={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
        }
      }}
      onTouchEnd={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      style={{ touchAction: 'manipulation' }}
    >
      <div 
        className="bg-background rounded-2xl max-w-md w-full p-6 relative my-8"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        style={{ touchAction: 'manipulation' }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10 touch-manipulation"
        >
          <X className="w-5 h-5" />
        </button>


        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Pagamento PIX
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Siga os passos abaixo para fazer o pagamento
          </p>

          {/* QR Code */}
          {qrCodeBase64 && qrCodeBase64 !== qrCode && (
            <div className="bg-muted/30 p-4 rounded-xl mb-4">
              <p className="text-xs text-muted-foreground mb-2 text-center font-medium">Ou escaneie o QR Code:</p>
              <img 
                src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                alt="QR Code do PIX" 
                className="w-full max-w-[300px] mx-auto rounded-lg shadow-sm"
                onError={(e) => {
                  // Se não for base64, tentar como URL
                  if (!qrCodeBase64.startsWith('data:')) {
                    (e.target as HTMLImageElement).src = qrCodeBase64;
                  }
                }}
              />
            </div>
          )}

          {/* Instruções passo a passo */}
          <div className="bg-muted/20 rounded-xl p-4 mb-4 text-left">
            <h3 className="font-semibold text-foreground mb-3 text-center">Como Pagar:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-foreground">1.</span>
                <span>Abra o app do seu banco</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground">2.</span>
                <span>Escolha a opção <strong className="text-foreground">Pix Copia e Cola</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground">3.</span>
                <span>Cole o código PIX abaixo</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground">4.</span>
                <span>Confirme o pagamento</span>
              </li>
            </ol>
          </div>

          {/* Código PIX Copia e Cola */}
          <div className="bg-muted/20 rounded-xl p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium text-center">COPIAR CÓDIGO:</p>
            <div 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                copyToClipboard(e);
                return false;
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                copyToClipboard(e);
                return false;
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bg-background border border-border rounded-lg p-3 break-all text-xs text-foreground font-mono max-h-32 overflow-y-auto cursor-pointer hover:bg-muted/50 transition-colors select-all touch-manipulation"
              style={{ userSelect: 'all', WebkitUserSelect: 'all' }}
              title="Clique para copiar"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  copyToClipboard();
                }
              }}
            >
              {qrCode || 'Carregando código PIX...'}
            </div>
          </div>

          {/* Botão copiar */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation?.();
              copyToClipboard(e);
              return false;
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation?.();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation?.();
              copyToClipboard(e);
              return false;
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold mb-3 flex items-center justify-center gap-2 transition-colors touch-manipulation"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Código copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar código PIX
              </>
            )}
          </button>

          {/* Botão "Já paguei" */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              checkPaymentStatus();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            disabled={isChecking}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold mb-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 touch-manipulation"
          >
            {isChecking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              'Já paguei'
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Após o pagamento, clique em "Já paguei" ou aguarde a confirmação automática
          </p>
        </div>
      </div>
    </div>
  );
};
