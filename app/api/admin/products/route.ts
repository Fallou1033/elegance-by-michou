import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getDbProducts, saveDbProduct, deleteDbProduct } from '@/lib/db';

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const products = await getDbProducts();
  return NextResponse.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Le nom et le prix sont obligatoires' },
        { status: 400 }
      );
    }

    const saved = await saveDbProduct(body);
    return NextResponse.json({ success: true, product: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID du produit manquant' }, { status: 400 });
    }

    const deleted = await deleteDbProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Produit supprimé' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}
