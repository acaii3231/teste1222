// Servidor Express para desenvolvimento local
// Simula as rotas da API do Vercel
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
const app = express();

const PORT = 3000;
const PUSHINPAY_TOKEN = '54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103';
const PUSHINPAY_BASE_URL = 'https://api.pushinpay.com.br/api';
// Webhook - pode ser configurado via variável de ambiente WEBHOOK_URL
// Ou gere um em https://webhook.site/#!/new
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://webhook.site/unique-id-aqui';

app.use(cors());
app.use(express.json());

const hashValue = (value) => {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
};

// Rota para criar PIX
app.post('/api/pix/create', async (req, res) => {
  try {
    const { value } = req.body;

    if (!value || !Number.isInteger(value) || value < 50) {
      return res.status(422).json({ 
        message: 'O campo value deve ser inteiro em centavos (mínimo 50)' 
      });
    }

    console.log('📤 Criando PIX com valor:', value, 'centavos');

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
      console.error('❌ PushinPay API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ PIX criado com sucesso!');
    console.log('📋 Resposta completa:', JSON.stringify(data, null, 2));

    // Retornar dados formatados conforme documentação PushinPay
    // A API retorna: { id, qr_code, qr_code_base64, status, value }
    // IMPORTANTE: qr_code = código copia e cola (string longa)
    //            qr_code_base64 = imagem do QR Code (base64)
    // A API pode retornar qr_code diretamente ou dentro de pix.qr_code
    const formattedResponse = {
      id: data.id,
      copiaCola: data.qr_code || data.pix?.copia_cola || data.copia_cola || '',
      qrCode: data.qr_code_base64 || data.pix?.qr_code_base64 || '',
      // Manter resposta original para debug
      original: data
    };
    
    // Log para debug
    console.log('📋 Resposta da PushinPay:', {
      id: data.id,
      tem_qr_code: !!data.qr_code,
      tem_qr_code_base64: !!data.qr_code_base64,
      qr_code_length: data.qr_code?.length || 0
    });
    
    if (!formattedResponse.copiaCola) {
      console.error('❌ ERRO: Código PIX (copiaCola) está vazio!');
      console.error('📋 Campos disponíveis na resposta:', Object.keys(data));
      console.error('📋 Resposta completa:', JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Código PIX obtido com sucesso!');
      console.log('📋 Tamanho do código:', formattedResponse.copiaCola.length, 'caracteres');
    }

    console.log('📤 Resposta formatada:', {
      id: formattedResponse.id,
      copiaCola: formattedResponse.copiaCola ? `${formattedResponse.copiaCola.substring(0, 50)}...` : 'VAZIO',
      qrCode: formattedResponse.qrCode ? 'PRESENTE' : 'VAZIO'
    });

    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('❌ Erro ao criar PIX:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao criar PIX',
      error: error.message 
    });
  }
});

// Rota para verificar status do PIX
app.get('/api/pix/check-by-pixid/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID do PIX é obrigatório' });
    }

    console.log('🔍 Verificando status do PIX:', id);

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
      console.error('❌ PushinPay API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Status do PIX:', data.status);

    // Retornar status formatado
    return res.status(200).json({
      id: data.id,
      status: data.status || 'pending',
      value: data.value,
      paid_at: data.paid_at,
      original: data
    });
  } catch (error) {
    console.error('❌ Erro ao verificar PIX:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao verificar PIX',
      error: error.message 
    });
  }
});

// Rota para enviar eventos para o TikTok (equivalente à função Netlify)
app.post('/api/tiktok-events', async (req, res) => {
  try {
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
    } = req.body || {};

    if (!pixelId || !accessToken || !eventName) {
      return res.status(400).json({
        message: 'pixelId, accessToken e eventName são obrigatórios'
      });
    }

    const properties = {};
    if (value !== undefined) properties.value = value;
    if (currency) properties.currency = currency;
    if (contentName) properties.content_name = contentName;
    if (contentType) properties.content_type = contentType;
    if (contentId) properties.content_id = contentId;
    if (url) properties.url = url;

    const user = {};
    const hashedEmail = hashValue(email);
    const hashedPhone = hashValue(phone);
    const hashedExternalId = hashValue(externalId);
    if (hashedEmail) user.email = [hashedEmail];
    if (hashedPhone) user.phone = [hashedPhone];
    if (hashedExternalId) user.external_id = [hashedExternalId];
    if (ip) user.ip = ip;
    if (userAgent) user.user_agent = userAgent;
    if (ttclid) user.ttclid = ttclid;
    if (ttp) user.ttp = ttp;

    const payload = {
      event_source: 'web',
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

    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('❌ TikTok Events API error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ Erro interno TikTok Events:', error);
    return res.status(500).json({
      message: 'Erro interno ao enviar evento para o TikTok',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor API rodando em http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponíveis:`);
  console.log(`   POST http://localhost:${PORT}/api/pix/create`);
  console.log(`   GET  http://localhost:${PORT}/api/pix/check-by-pixid/:id`);
  console.log(`   POST http://localhost:${PORT}/api/tiktok-events`);
});

