// Facebook Pixel helper functions

declare global {
  interface Window {
    fbq: any;
  }
}

// Flag global para evitar múltiplas inicializações
let pixelInitialized = false;

export const initFacebookPixel = (pixelId: string) => {
  if (!pixelId) return;
  
  // Check if pixel is already initialized
  if (window.fbq && pixelInitialized) {
    console.log('⚠️  Facebook Pixel já foi inicializado, ignorando nova inicialização');
    return;
  }
  
  // Verificar se o script já foi carregado no DOM
  if (document.querySelector('script[src*="fbevents.js"]')) {
    console.log('⚠️  Script do Facebook Pixel já foi carregado no DOM');
    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      pixelInitialized = true;
      console.log('✅ Facebook Pixel reinicializado:', pixelId);
      return;
    }
  }
  
  // Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  pixelInitialized = true;
  console.log('✅ Facebook Pixel inicializado:', pixelId);
};

// Flag para evitar múltiplos InitiateCheckout
let checkoutInitiated = false;

export const trackInitiateCheckout = (value: number, currency: string = 'BRL') => {
  if (window.fbq && !checkoutInitiated) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
    });
    checkoutInitiated = true;
    console.log('📊 Evento InitiateCheckout disparado');
  } else if (checkoutInitiated) {
    console.log('⚠️  InitiateCheckout já foi disparado, ignorando');
  }
};

// Flag global para evitar múltiplos Purchase
let purchaseTracked = false;
let purchaseTransactionId: string | undefined = undefined;

export const trackPurchase = (value: number, currency: string = 'BRL', transactionId?: string) => {
  // Verificar se já foi disparado para esta transação
  if (purchaseTracked && purchaseTransactionId === transactionId) {
    console.log('⚠️  Purchase já foi disparado para esta transação, ignorando');
    return;
  }
  
  // Garantir que o valor está em reais (não centavos)
  // Se o valor for menor que 1, pode estar em centavos, então converter
  let valueInReais = value;
  if (value < 1 && value > 0) {
    // Se o valor for muito pequeno (ex: 0.5), pode estar em formato errado
    // Mas se for realmente 0.5 reais, deixar como está
    console.log('⚠️  Valor do Purchase parece muito baixo:', value);
  }
  
  // Se o valor for muito grande (mais de 10000), provavelmente está em centavos
  if (value > 10000) {
    valueInReais = value / 100;
    console.log('📊 Convertendo valor de centavos para reais:', value, '->', valueInReais);
  }
  
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: valueInReais,
      currency: currency,
      transaction_id: transactionId,
    });
    purchaseTracked = true;
    purchaseTransactionId = transactionId;
    console.log('📊 Evento Purchase disparado:', {
      value: valueInReais,
      currency,
      transaction_id: transactionId
    });
  }
};

// Função para resetar o flag (útil para testes)
export const resetPurchaseTracking = () => {
  purchaseTracked = false;
  purchaseTransactionId = undefined;
};

export const trackAddToCart = (value: number, currency: string = 'BRL') => {
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      value: value,
      currency: currency,
    });
  }
};
