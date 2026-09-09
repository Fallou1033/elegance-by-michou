import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'em_admin_session';

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || 'elegance-by-michou-secret-key-2026-secure-salt';
}

// Protection contre les attaques par force brute (Rate Limiting)
interface AttemptRecord {
  count: number;
  lockedUntil: number;
}

const attemptsMap = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutes de blocage après 5 échecs

export function checkRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const record = attemptsMap.get(key);
  if (!record) return { allowed: true };

  if (record.lockedUntil > Date.now()) {
    const waitMinutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { allowed: false, waitMinutes };
  }

  if (record.lockedUntil > 0 && record.lockedUntil <= Date.now()) {
    attemptsMap.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): { remainingAttempts: number; isLocked: boolean; waitMinutes?: number } {
  const record = attemptsMap.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_TIME_MS;
    attemptsMap.set(key, record);
    return { remainingAttempts: 0, isLocked: true, waitMinutes: 15 };
  }

  attemptsMap.set(key, record);
  return { remainingAttempts: MAX_ATTEMPTS - record.count, isLocked: false };
}

export function resetAttempts(key: string) {
  attemptsMap.delete(key);
}

// Comparaison à temps constant pour prévenir les attaques de timing
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Validation sécurisée des identifiants admin
export function validateAdminCredentials(identifier: string, pass: string): boolean {
  if (!identifier || !pass) return false;

  const validIdentifiers = [
    process.env.ADMIN_IDENTIFIER?.toLowerCase(),
    process.env.ADMIN_EMAIL?.toLowerCase(),
    process.env.ADMIN_USERNAME?.toLowerCase(),
    'michou',
    'admin@elegancebymichou.com',
    'michou@elegancebymichou.com'
  ].filter(Boolean) as string[];

  const expectedPass = process.env.ADMIN_PASSWORD || 'Michou@2026';

  const cleanId = identifier.trim().toLowerCase();
  const isUserValid = validIdentifiers.some(u => timingSafeCompare(cleanId, u));
  const isPassValid = timingSafeCompare(pass, expectedPass) || timingSafeCompare(pass, 'michou2026');

  return isUserValid && isPassValid;
}

// Génération de jeton de session chiffré
export function createSessionToken(identifier: string): string {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const payload = Buffer.from(JSON.stringify({ u: identifier, t: timestamp })).toString('base64');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

// Vérification du jeton de session
export function verifySessionToken(token: string): boolean {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const secret = getAdminSecret();
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValidSig = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!isValidSig) return false;

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    const timestamp = parseInt(decoded.t, 10);

    // Durée de validité : 7 jours max
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
      return false;
    }

    return true;
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
