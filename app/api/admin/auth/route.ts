import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  validateAdminCredentials,
  createSessionToken,
  verifySessionToken,
  ADMIN_COOKIE_NAME,
  checkRateLimit,
  recordFailedAttempt,
  resetAttempts,
} from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, password, action } = body;

    // Déconnexion immédiate (ex: sendBeacon à la fermeture de l'onglet/fenêtre)
    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'Déconnecté' });
      res.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: '',
        httpOnly: true,
        path: '/',
        maxAge: 0,
      });
      return res;
    }

    // Récupération de l'adresse IP du client pour le rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'local';
    const rateLimitKey = `${ip}:${identifier || 'unknown'}`;

    // 1. Vérification du blocage anti force-brute
    const limitCheck = checkRateLimit(rateLimitKey);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives de connexion échouées. Accès temporairement suspendu pendant ${limitCheck.waitMinutes || 15} minutes par mesure de sécurité.`,
        },
        { status: 429 }
      );
    }

    // 2. Vérification des champs requis
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Veuillez renseigner votre identifiant et votre mot de passe.' },
        { status: 400 }
      );
    }

    // 3. Validation des identifiants
    const isValid = validateAdminCredentials(identifier, password);

    if (!isValid) {
      const attempt = recordFailedAttempt(rateLimitKey);
      if (attempt.isLocked) {
        return NextResponse.json(
          {
            success: false,
            error: 'Trop de tentatives erronées. Votre accès est bloqué pendant 15 minutes.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Identifiant ou mot de passe incorrect. (Tentative(s) restante(s) : ${attempt.remainingAttempts})`,
        },
        { status: 401 }
      );
    }

    // 4. Succès : Réinitialisation du compteur d'erreurs
    resetAttempts(rateLimitKey);

    const token = createSessionToken(identifier);
    const response = NextResponse.json({ success: true });

    // Cookie de session temporaire HTTP-only (sans maxAge : détruit à la fermeture du navigateur)
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Une erreur de sécurité est survenue. Veuillez réessayer.' },
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
