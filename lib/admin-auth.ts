import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'em_admin_session';
const DEFAULT_ADMIN_PASS = 'michou2026';

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || 'elegance-by-michou-secret-key-2026';
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS;
}

export function createSessionToken(): string {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`admin:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const [timestamp, signature] = token.split('.');
    if (!timestamp || !signature) return false;

    // Durée de validité de session : 7 jours
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(timestamp, 10) > maxAge) {
      return false;
    }

    const secret = getAdminSecret();
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`admin:${timestamp}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie?.value) return false;
  return verifySessionToken(sessionCookie.value);
}

export { ADMIN_COOKIE_NAME };
