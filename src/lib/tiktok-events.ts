interface TikTokEventOptions {
  pixelId?: string;
  accessToken?: string;
  eventName: string;
  eventId?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentType?: string;
  contentId?: string;
  url?: string;
  email?: string;
  phone?: string;
  externalId?: string;
  ip?: string;
  userAgent?: string;
  ttclid?: string | null;
  ttp?: string | null;
}

export const sendTikTokServerEvent = async (options: TikTokEventOptions) => {
  const { pixelId, accessToken } = options;

  if (!pixelId || !accessToken) {
    return;
  }

  try {
    await fetch("/api/tiktok-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pixelId,
        accessToken,
        eventName: options.eventName,
        eventId: options.eventId,
        value: options.value,
        currency: options.currency,
        contentName: options.contentName,
        contentType: options.contentType,
        contentId: options.contentId,
        url: options.url,
        email: options.email,
        phone: options.phone,
        externalId: options.externalId,
        ip: options.ip,
        userAgent: options.userAgent,
        ttclid: options.ttclid || undefined,
        ttp: options.ttp || undefined,
      }),
    });
  } catch (error) {
    console.error("❌ Erro ao enviar evento para o TikTok Events API", error);
  }
};


