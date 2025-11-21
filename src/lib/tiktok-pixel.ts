// Helpers para o Pixel do TikTok

declare global {
  interface Window {
    ttq?: {
      page: () => void;
      track: (event: string, payload?: Record<string, any>) => void;
      load?: (...args: any[]) => void;
      instance?: (...args: any[]) => void;
      push?: (...args: any[]) => void;
      _i?: Record<string, any>;
      _t?: Record<string, any>;
      _o?: Record<string, any>;
      methods?: string[];
      [key: string]: any;
    };
    TiktokAnalyticsObject?: string;
  }
}

let tiktokPixelInitialized = false;

export const initTikTokPixel = (pixelId: string) => {
  if (!pixelId || tiktokPixelInitialized) {
    if (pixelId && window.ttq) {
      window.ttq.page();
    }
    return;
  }

  (function(w: any, d: Document, t: string, pixel: string) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w[t] = w[t] || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
      "holdConsent",
      "revokeConsent",
      "grantConsent"
    ];
    ttq.setAndDefer = function(ttq: any, method: string) {
      ttq[method] = function() {
        ttq.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.instance = function(id: string) {
      const queue = ttq._i[id] || [];
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(queue, ttq.methods[i]);
      }
      return queue;
    };
    ttq.load = function(id: string, opts?: Record<string, any>) {
      const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[id] = [];
      ttq._i[id]._u = src;
      ttq._t = ttq._t || {};
      ttq._t[id] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[id] = opts || {};
      const script = d.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${src}?sdkid=${id}&lib=${t}`;
      const firstScript = d.getElementsByTagName("script")[0];
      firstScript?.parentNode?.insertBefore(script, firstScript);
    };

    ttq.load(pixel);
    ttq.page();
  })(window, document, "ttq", pixelId);

  tiktokPixelInitialized = true;
  console.log("✅ TikTok Pixel inicializado:", pixelId);
};

const trackTikTokEvent = (eventName: string, payload?: Record<string, any>) => {
  if (!window.ttq) {
    console.warn("⚠️ TikTok Pixel não está disponível para o evento:", eventName);
    return;
  }

  if (eventName === "page") {
    window.ttq.page();
    return;
  }

  window.ttq.track(eventName, payload);
  console.log(`📊 Evento TikTok ${eventName} enviado`, payload);
};

export const trackTikTokViewContent = (payload?: Record<string, any>) => {
  trackTikTokEvent("ViewContent", payload);
};

export const trackTikTokAddToCart = (payload?: Record<string, any>) => {
  trackTikTokEvent("AddToCart", payload);
};

export const trackTikTokInitiateCheckout = (payload?: Record<string, any>) => {
  trackTikTokEvent("InitiateCheckout", payload);
};

export const trackTikTokPurchase = (payload?: Record<string, any>) => {
  trackTikTokEvent("Purchase", payload);
};

