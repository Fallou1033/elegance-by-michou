import { NextRequest, NextResponse } from 'next/server';
import { getDbProductById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = getDbProductById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produit non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, product },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
