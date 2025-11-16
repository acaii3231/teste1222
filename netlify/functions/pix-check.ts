// Netlify Function para verificar status do PIX
import type { Handler } from '@netlify/functions';

const PUSHINPAY_TOKEN = '54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103';
const PUSHINPAY_BASE_URL = 'https://api.pushinpay.com.br/api';

const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    // Extrair ID da URL
    // O path será algo como: /api/pix/check-by-pixid/123 ou /.netlify/functions/pix-check/123
    let id: string | undefined;
    
    // Tentar pegar da query string primeiro
    if (event.queryStringParameters && event.queryStringParameters.id) {
      id = event.queryStringParameters.id;
    } else {
      // Extrair do path: pegar o último segmento
      const pathParts = event.path.split('/').filter(p => p);
      // Se o path contém 'check-by-pixid', pegar o próximo segmento
      const checkIndex = pathParts.indexOf('check-by-pixid');
      if (checkIndex !== -1 && pathParts[checkIndex + 1]) {
        id = pathParts[checkIndex + 1];
      } else {
        // Caso contrário, pegar o último segmento
        id = pathParts[pathParts.length - 1];
      }
    }

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'ID do PIX é obrigatório' }),
      };
    }

    // Consultar status do PIX na PushinPay
    const response = await fetch(`${PUSHINPAY_BASE_URL}/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PUSHINPAY_TOKEN}`,
        'Accept': 'application/json',
      }
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

    // Retornar status formatado
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: data.id,
        status: data.status || 'pending',
        value: data.value,
        paid_at: data.paid_at,
        original: data
      }),
    };
  } catch (error: any) {
    console.error('Erro ao verificar PIX:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Erro interno ao verificar PIX',
        error: error.message 
      }),
    };
  }
};

export { handler };

