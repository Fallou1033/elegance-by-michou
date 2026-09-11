import { NextRequest, NextResponse } from 'next/server';
import { registerDbPendingOrder } from '@/lib/db';

// Enregistre une commande en ATTENTE de confirmation de paiement.
// Tant que le webhook de paiement ne l'a pas confirmée, elle reste invisible côté admin.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = body?.order;

    if (!order?.orderNumber || !order?.customerName || !order?.phone || !Array.isArray(order?.items)) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    const pending = await registerDbPendingOrder({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address || '',
      city: order.city || 'Dakar',
      notes: order.notes || '',
      paymentMethod: order.paymentMethod === 'orange-money' ? 'orange-money' : 'wave',
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      shipping: Number(order.shipping) || 0,
      total: Number(order.total) || 0,
    });

    return NextResponse.json({ success: true, orderNumber: pending.orderNumber });
  } catch (error: any) {
    console.error('Erreur enregistrement commande en attente :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}