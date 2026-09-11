import { NextRequest, NextResponse } from 'next/server';
import { confirmDbOrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Orange Money Webhook] Notification reçue :', JSON.stringify(body, null, 2));

    const status = body?.status;
    const orderNumber = body?.order_id || body?.notif_token;

    // Orange Money notifie avec status SUCCESS
    if (status === 'SUCCESS' && orderNumber) {
      console.log(`[Orange Money Webhook] Validation commande ${orderNumber}`);
      await confirmDbOrder(orderNumber);
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('[Orange Money Webhook] Erreur de traitement :', error);
    return NextResponse.json({ error: 'Erreur webhook' }, { status: 400 });
  }
}
