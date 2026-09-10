import { NextRequest, NextResponse } from 'next/server';
import { requestOrangeMoneyPayment } from '@/lib/orange-money';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, total, customerName, phone } = body;

    if (!orderNumber || !total || !customerName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Paramètres de commande manquants' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const result = await requestOrangeMoneyPayment({
      orderNumber,
      total: Number(total),
      customerName,
      phone,
      baseUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Orange Money Payment Route Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur interne lors de l’appel Orange Money' },
      { status: 500 }
    );
  }
}
