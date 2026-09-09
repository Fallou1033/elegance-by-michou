import { NextRequest, NextResponse } from 'next/server';
import { createDbOrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      phone,
      address,
      city,
      notes,
      paymentMethod,
      items,
      subtotal,
      shipping,
      total,
    } = body;

    if (!orderNumber || !customerName || !phone || !items) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    const order = createDbOrder({
      orderNumber,
      customerName,
      phone,
      address: address || '',
      city: city || 'Dakar',
      notes: notes || '',
      paymentMethod: paymentMethod === 'orange-money' ? 'orange-money' : 'wave',
      items: items || [],
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Erreur enregistrement commande :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
