/**
 * Module d'intégration de l'API officielle Orange Money Web Payment (Sénégal)
 * Documentation : https://developer.orange.com/apis/om-webpay
 */

export const ORANGE_MONEY_CONFIG = {
  clientId: process.env.ORANGE_MONEY_CLIENT_ID || '',
  clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET || '',
  merchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY || '',
  env: (process.env.ORANGE_MONEY_ENV || 'prod') as 'dev' | 'prod',
};

const OAUTH_URL = 'https://api.orange.com/oauth/v3/token';

export interface OrangeMoneyPaymentResult {
  success: boolean;
  redirectUrl?: string;
  payToken?: string;
  error?: string;
  isFallback?: boolean;
}

/**
 * Obtient le jeton d'accès OAuth2 auprès d'Orange Developer
 */
async function getOrangeOAuthToken(): Promise<string | null> {
  const { clientId, clientSecret } = ORANGE_MONEY_CONFIG;
  if (!clientId || !clientSecret) return null;

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await res.json();
    if (res.ok && data?.access_token) {
      return data.access_token;
    }

    console.warn('[Orange Money] Échec récupération token OAuth2 :', data);
    return null;
  } catch (err) {
    console.error('[Orange Money] Erreur OAuth2 :', err);
    return null;
  }
}

/**
 * Initialise une session de paiement web Orange Money
 */
export async function requestOrangeMoneyPayment(params: {
  orderNumber: string;
  total: number;
  customerName: string;
  phone: string;
  baseUrl: string;
}): Promise<OrangeMoneyPaymentResult> {
  const { orderNumber, total, baseUrl } = params;

  // Si les clés d'API Orange Money ne sont pas encore configurées, basculer en mode secours
  if (!ORANGE_MONEY_CONFIG.clientId || !ORANGE_MONEY_CONFIG.clientSecret || !ORANGE_MONEY_CONFIG.merchantKey) {
    console.warn('[Orange Money] Clés d’API non configurées. Bascule vers la confirmation directe.');
    return {
      success: true,
      isFallback: true,
      redirectUrl: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&payment=orange-money&mode=direct`,
    };
  }

  const token = await getOrangeOAuthToken();
  if (!token) {
    return {
      success: false,
      error: 'Impossible d’authentifier la boutique auprès d’Orange Money.',
      isFallback: true,
      redirectUrl: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&payment=orange-money&mode=direct`,
    };
  }

  const webpayEndpoint = ORANGE_MONEY_CONFIG.env === 'prod'
    ? 'https://api.orange.com/orange-money-webpay/sn/v1/webpayment'
    : 'https://api.orange.com/orange-money-webpay/dev/v1/webpayment';

  const isHttps = baseUrl.startsWith('https://');
  const secureBaseUrl = isHttps ? baseUrl : 'https://elegance-by-michou.vercel.app';

  const payload = {
    merchant_key: ORANGE_MONEY_CONFIG.merchantKey,
    currency: 'OUV', // Code monnaie CFA UEMOA utilisé par l'API Orange Money
    order_id: orderNumber,
    amount: Math.round(total),
    return_url: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&om=success`,
    cancel_url: `${baseUrl}/checkout?ref=${encodeURIComponent(orderNumber)}&om=cancel`,
    notif_url: `${secureBaseUrl}/api/orange-money/webhook`,
    lang: 'fr',
    reference: `Commande ${orderNumber} - Elegance By Michou`,
  };

  try {
    const res = await fetch(webpayEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if ((res.status === 200 || res.status === 201) && data?.payment_url) {
      return {
        success: true,
        redirectUrl: data.payment_url,
        payToken: data.pay_token,
      };
    }

    const errorMessage = data?.message || data?.description || 'Erreur lors de l’initialisation Orange Money.';
    console.warn('[Orange Money] Réponse inattendue :', data);

    return {
      success: false,
      error: errorMessage,
      isFallback: true,
      redirectUrl: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&payment=orange-money&mode=direct`,
    };
  } catch (err: any) {
    console.error('[Orange Money] Erreur de communication serveur :', err);
    return {
      success: false,
      error: err?.message || 'Connexion impossible au serveur Orange Money.',
      isFallback: true,
      redirectUrl: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&payment=orange-money&mode=direct`,
    };
  }
}
