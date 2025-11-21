import type { Handler } from "@netlify/functions";
import crypto from "node:crypto";

const hashValue = (value?: string) => {
  if (!value) return undefined;
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
};

const handler: Handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      pixelId,
      accessToken,
      eventName,
      eventId,
      value,
      currency,
      contentName,
      contentType,
      contentId,
      url,
      email,
      phone,
      externalId,
      ip,
      userAgent,
      ttclid,
      ttp,
    } = body;

    if (!pixelId || !accessToken || !eventName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "pixelId, accessToken e eventName são obrigatórios",
        }),
      };
    }

    const hashedEmail = hashValue(email);
    const hashedPhone = hashValue(phone);
    const hashedExternalId = hashValue(externalId);

    const properties: Record<string, unknown> = {};
    if (value !== undefined) properties.value = value;
    if (currency) properties.currency = currency;
    if (contentName) properties.content_name = contentName;
    if (contentType) properties.content_type = contentType;
    if (contentId) properties.content_id = contentId;
    if (url) properties.url = url;

    const user: Record<string, unknown> = {};
    if (hashedEmail) user.email = [hashedEmail];
    if (hashedPhone) user.phone = [hashedPhone];
    if (hashedExternalId) user.external_id = [hashedExternalId];
    if (ip) user.ip = ip;
    if (userAgent) user.user_agent = userAgent;
    if (ttclid) user.ttclid = ttclid;
    if (ttp) user.ttp = ttp;

    const payload = {
      event_source: "web",
      event_source_id: pixelId,
      data: [
        {
          event: eventName,
          event_id: eventId || `${eventName}-${Date.now()}`,
          timestamp: Math.floor(Date.now() / 1000),
          properties,
          user,
        },
      ],
    };

    const response = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Token": accessToken,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro TikTok Events API:", data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data,
      }),
    };
  } catch (error: any) {
    console.error("Erro interno TikTok Events:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Erro interno ao enviar evento para o TikTok",
        error: error?.message,
      }),
    };
  }
};

export { handler };


