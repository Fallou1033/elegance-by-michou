import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  getDbConnectionStatus,
  getDbProducts,
  getDbOrders,
  exportDatabaseBackup,
  restoreDatabaseBackup,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'export') {
    const backup = await exportDatabaseBackup();
    return NextResponse.json({ success: true, backup });
  }

  const connectionStatus = getDbConnectionStatus();
  const products = await getDbProducts();
  const orders = await getDbOrders();

  return NextResponse.json({
    success: true,
    connection: connectionStatus,
    stats: {
      totalProducts: products.length,
      totalOrders: orders.length,
    },
  });
}

export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action === 'restore' && body.backup) {
      const result = await restoreDatabaseBackup(body.backup);
      return NextResponse.json({
        success: true,
        message: `Restauration réussie : ${result.countProducts} articles et ${result.countOrders} commandes restaurés.`,
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur lors du traitement' }, { status: 500 });
  }
}
