import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getDbOrders, updateDbOrderStatus, OrderStatus } from '@/lib/db';

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orders = getDbOrders();
  return NextResponse.json({ success: true, orders });
}

export async function PATCH(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { orderNumber, status } = await req.json();

    if (!orderNumber || !status) {
      return NextResponse.json(
        { error: 'Numéro de commande et statut requis' },
        { status: 400 }
      );
    }

    const updated = updateDbOrderStatus(orderNumber, status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}
