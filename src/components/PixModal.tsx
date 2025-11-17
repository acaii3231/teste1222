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

export const PixModal = ({ qrCodeBase64, qrCode, onClose, paymentStatus, isCheckingPayment = true, pixId }: PixModalProps) => {
  const [copied, setCopied] = useState(false);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(paymentStatus || 'pending');
  const [isChecking, setIsChecking] = useState(false);

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

  const copyToClipboard = async (e?: React.MouseEvent | React.TouchEvent) => {
    // Prevenir qualquer comportamento padrão ANTES de qualquer coisa
    try {
      if (e) {
        if ('preventDefault' in e && typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
        if ('nativeEvent' in e && e.nativeEvent && 'stopImmediatePropagation' in e.nativeEvent) {
          e.nativeEvent.stopImmediatePropagation();
        }
      }
    } catch (preventError) {
      console.warn('Erro ao prevenir eventos:', preventError);
    }
    
    if (!qrCode || qrCode.trim() === '') {
      console.warn('Código PIX não disponível');
      return;
    }
    
    // Usar setTimeout para garantir que o evento seja processado antes da cópia
    setTimeout(async () => {
      try {
        // Método 1: Tentar usar a API moderna do clipboard
        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(qrCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
          } catch (clipboardError) {
            console.log('Clipboard API falhou, tentando fallback:', clipboardError);
            // Continua para o fallback
          }
        }
        
        // Método 2: Fallback para dispositivos mais antigos ou quando clipboard API falha
        const textArea = document.createElement('textarea');
        textArea.value = qrCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        textArea.setAttribute('readonly', '');
        textArea.setAttribute('contenteditable', 'true');
        
        document.body.appendChild(textArea);
        
        // Para iOS
        if (navigator.userAgent.match(/ipad|iphone/i)) {
          const range = document.createRange();
          range.selectNodeContents(textArea);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
          textArea.setSelectionRange(0, 999999);
        } else {
          textArea.focus();
          textArea.select();
        }
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } else {
            console.warn('execCommand copy retornou false');
          }
        } catch (err) {
          console.error('Erro ao copiar com execCommand:', err);
        } finally {
          // Sempre remover o textArea
          try {
            if (textArea.parentNode) {
              document.body.removeChild(textArea);
            }
          } catch (removeError) {
            console.warn('Erro ao remover textArea:', removeError);
          }
        }
      } catch (error) {
        console.error('Erro geral ao copiar para clipboard:', error);
      }
    }, 0);
  };

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
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
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
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
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
                copyToClipboard(e);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copyToClipboard(e);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              className="bg-background border border-border rounded-lg p-3 break-all text-xs text-foreground font-mono max-h-32 overflow-y-auto cursor-pointer hover:bg-muted/50 transition-colors select-all touch-manipulation"
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
              copyToClipboard(e);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyToClipboard(e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold mb-3 flex items-center justify-center gap-2 transition-colors touch-manipulation"
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
