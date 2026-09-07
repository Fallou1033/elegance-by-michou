/**
 * Module d'intégration de la passerelle de paiement PayTech Sénégal (Wave & Orange Money)
 */

export const PAYTECH_API_URL = 'https://paytech.sn/api/payment/request-payment';

export const PAYTECH_CONFIG = {
  apiKey: process.env.PAYTECH_API_KEY || 'a2c8c1f036e510969302074c9558e9b7dfc89e189d4d294a63c11a37723e030e',
  apiSecret: process.env.PAYTECH_API_SECRET || 'c72d648f8e162846f7427047f77561c29f7042bc2686344dcedd0200943b2bbd',
  env: (process.env.PAYTECH_ENV || 'test') as 'test' | 'prod',
};

export interface PayTechPaymentPayload {
  item_name: string;
  item_price: number;
  currency: string;
  ref_command: string;
  command_name: string;
  env: 'test' | 'prod';
  ipn_url: string;
  success_url: string;
  cancel_url: string;
  custom_field?: string;
  target_payment?: string;
}

export interface PayTechPaymentResult {
  success: boolean;
  token?: string;
  redirectUrl?: string;
  error?: string;
  isProdInactive?: boolean;
}

export async function requestPayTechPayment(params: {
  orderNumber: string;
  total: number;
  customerName: string;
  phone: string;
  paymentMethod: 'wave' | 'orange-money';
  baseUrl: string;
  customData?: Record<string, any>;
}): Promise<PayTechPaymentResult> {
  const { orderNumber, total, customerName, phone, paymentMethod, baseUrl, customData } = params;

  // Cible de paiement PayTech
  const targetPayment = paymentMethod === 'orange-money' ? 'Orange Money' : 'Wave';

  // PayTech exige impérativement que les URLs (notamment ipn_url) soient en HTTPS
  const isHttps = baseUrl.startsWith('https://');
  const httpsBaseUrl = isHttps ? baseUrl : 'https://elegance-by-michou.vercel.app';

  const payload: PayTechPaymentPayload = {
    item_name: `Commande ${orderNumber} - Elegance By Michou`,
    item_price: total,
    currency: 'XOF',
    ref_command: orderNumber,
    command_name: `Commande ${orderNumber} (${customerName})`,
    env: PAYTECH_CONFIG.env,
    ipn_url: `${httpsBaseUrl}/api/paytech/ipn`,
    success_url: `${baseUrl}/confirmation?ref=${encodeURIComponent(orderNumber)}&paytech=success`,
    cancel_url: `${baseUrl}/checkout?ref=${encodeURIComponent(orderNumber)}&paytech=cancel`,
    target_payment: targetPayment,
    custom_field: JSON.stringify({
      orderNumber,
      customerName,
      phone,
      paymentMethod,
      ...customData,
    }),
  };

  try {
    const res = await fetch(PAYTECH_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'API_KEY': PAYTECH_CONFIG.apiKey,
        'API_SECRET': PAYTECH_CONFIG.apiSecret,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data && (data.success === 1 || data.token)) {
      const redirectUrl = data.redirect_url || data.redirectUrl;
      return {
        success: true,
        token: data.token,
        redirectUrl,
      };
    }

    // Cas où le compte prod n'est pas encore activé par PayTech
    const errorMessage = Array.isArray(data?.error)
      ? data.error.join(' ')
      : data?.message || 'Erreur lors de l’initialisation du paiement PayTech.';

    const isProdInactive = errorMessage.includes('support@paytech.sn') || errorMessage.includes('production');

    return {
      success: false,
      error: errorMessage,
      isProdInactive,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Connexion impossible aux serveurs PayTech.',
    };
  }
}
