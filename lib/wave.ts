/**
 * Module d'intégration de l'API officielle Wave Checkout (Sénégal)
 * Documentation : https://docs.wave.com/
 */

export const WAVE_API_URL = 'https://api.wave.com/v1/checkout/sessions';

export const WAVE_CONFIG = {
  apiKey: process.env.WAVE_API_KEY || '',
  webhookSecret: process.env.WAVE_WEBHOOK_SECRET || '',
};

export interface WaveCheckoutResult {
  success: boolean;
  redirectUrl?: string;
  sessionId?: string;
  error?: string;
  isFallback?: boolean;
}

export async function requestWavePayment(params: {
  orderNumber: string;
  total: number;
  customerName: string;
  phone: string;
  baseUrl: string;
}): Promise<WaveCheckoutResult> {
  const { orderNumber, total, baseUrl } = params;

  // Si aucune clé d'API Wave n'est configurée, basculer vers le mode secours
  if (!WAVE_CONFIG.apiKey) {
    console.warn('[Wave] WAVE_API_KEY non configurée. Bascule vers la confirmation directe.');
    return {
      success: true,
      isFallback: true,
      redirectUrl: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&payment=wave&mode=direct`,
    };
  }

  try {
    const payload = {
      amount: String(Math.round(total)),
      currency: 'XOF',
      error_url: `${baseUrl}/checkout?ref=${encodeURIComponent(orderNumber)}&wave=cancel`,
      success_url: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&wave=success`,
      client_reference: orderNumber,
    };

    const res = await fetch(WAVE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WAVE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data?.wave_launch_url) {
      return {
        success: true,
        redirectUrl: data.wave_launch_url,
        sessionId: data.id,
      };
    }

    const errorMessage = data?.message || data?.error || 'Erreur lors de l’initialisation du paiement Wave.';
    console.warn('[Wave] Réponse API inattendue :', data);

    return {
      success: false,
      error: errorMessage,
      isFallback: true,
      redirectUrl: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&payment=wave&mode=direct`,
    };
  } catch (err: any) {
    console.error('[Wave] Erreur de connexion aux serveurs Wave :', err);
    return {
      success: false,
      error: err?.message || 'Connexion impossible aux serveurs Wave.',
      isFallback: true,
      redirectUrl: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&payment=wave&mode=direct`,
    };
  }
}
