import { NextRequest, NextResponse } from 'next/server';
import { requestPayTechPayment } from '@/lib/paytech';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, total, customerName, phone, paymentMethod, address, city, notes, items } = body;

    if (!orderNumber || !total || !customerName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Paramètres de commande manquants' },
        { status: 400 }
      );
    }

    // Détermination dynamique de l'URL de base du site
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const result = await requestPayTechPayment({
      orderNumber,
      total: Number(total),
      customerName,
      phone,
      paymentMethod: paymentMethod === 'orange-money' ? 'orange-money' : 'wave',
      baseUrl,
      customData: {
        address,
        city,
        notes,
        itemCount: Array.isArray(items) ? items.length : 1,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          isProdInactive: result.isProdInactive,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      redirectUrl: result.redirectUrl,
    });
  } catch (error: any) {
    console.error('PayTech Payment API Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur interne du serveur de paiement' },
      { status: 500 }
    );
  }
}
