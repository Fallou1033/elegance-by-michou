import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let data: any = {};

    if (contentType.includes('application/json')) {
      data = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        data[key] = value;
      });
    } else {
      const text = await req.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    console.log('[PayTech IPN] Notification reçue :', JSON.stringify(data, null, 2));

    // Répondre 200 OK pour accuser réception auprès de PayTech
    return NextResponse.json({ status: 'success', message: 'IPN received' }, { status: 200 });
  } catch (err: any) {
    console.error('[PayTech IPN] Erreur de traitement :', err);
    return NextResponse.json({ status: 'error', message: err?.message }, { status: 500 });
  }
}
