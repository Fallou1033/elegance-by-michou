import { NextRequest, NextResponse } from 'next/server';
import { updateDbOrderStatus } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Wave Webhook] Événement reçu :', JSON.stringify(body, null, 2));

    const eventType = body?.type;
    const sessionData = body?.data;

    // Événement Wave Checkout Session Completed
    if (eventType === 'checkout.session.completed' || sessionData?.checkout_status === 'complete') {
      const orderNumber = sessionData?.client_reference;
      if (orderNumber) {
        console.log(`[Wave Webhook] Validation commande ${orderNumber}`);
        await updateDbOrderStatus(orderNumber, 'confirmee');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Wave Webhook] Erreur de traitement :', error);
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 400 });
  }
}
