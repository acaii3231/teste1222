// Netlify Function para criar PIX
import type { Handler } from '@netlify/functions';

const PUSHINPAY_TOKEN = '54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103';
const PUSHINPAY_BASE_URL = 'https://api.pushinpay.com.br/api';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://webhook.site/unique-id-aqui';

const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { value } = JSON.parse(event.body || '{}');

    if (!value || !Number.isInteger(value) || value < 50) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({ 
          message: 'O campo value deve ser inteiro em centavos (mínimo 50)' 
        }),
      };
    }

    // Criar PIX na PushinPay
    const response = await fetch(`${PUSHINPAY_BASE_URL}/pix/cashIn`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: value,
        webhook_url: WEBHOOK_URL
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PushinPay API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(data),
      };
    }

    console.log('PIX criado com sucesso:', data.id);

    // Retornar dados formatados
    const formattedResponse = {
      id: data.id,
      copiaCola: data.qr_code || data.pix?.copia_cola || data.copia_cola || '',
      qrCode: data.qr_code_base64 || data.pix?.qr_code || data.qr_code || '',
      original: data
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedResponse),
    };
  } catch (error: any) {
    console.error('Erro ao criar PIX:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Erro interno ao criar PIX',
        error: error.message 
      }),
    };
  }
};

export { handler };

