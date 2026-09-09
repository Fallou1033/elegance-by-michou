import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAdminPassword,
  createSessionToken,
  verifySessionToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = getAdminPassword();

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe administrateur incorrect' },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true });

    // Cookie de session 7 jours
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value || !verifySessionToken(sessionCookie.value)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Déconnecté' });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
