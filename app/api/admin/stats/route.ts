import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getFinancialAnalytics } from '@/lib/db';

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const stats = await getFinancialAnalytics();
  return NextResponse.json({ success: true, stats });
}
