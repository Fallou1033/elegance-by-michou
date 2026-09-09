'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Veuillez saisir votre e-mail ou nom d’utilisateur.');
      return;
    }
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe administrateur.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setError('Erreur de communication sécurisée avec le serveur. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <div className="relative w-16 h-16 mx-auto aspect-square rounded-2xl bg-white shadow-md p-2 flex items-center justify-center border border-stone/15">
              <Image
                src="/images/logo-em.png"
                alt="Elegance By Michou"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-anthracite">
            Espace Administrateur
          </h1>
          <p className="text-stone text-xs sm:text-sm mt-1.5">
            Portail d&apos;accès sécurisé réservé à la direction
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone/15 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Identifiant unique / Email */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-2"
              >
                E-mail ou Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone">
                  <User size={18} />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="ex: michou ou contact@..."
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-stone/30 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all bg-[#FAF9F6]/50"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-2"
              >
                Mot de passe administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-stone/30 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all bg-[#FAF9F6]/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone hover:text-anthracite transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Bouton de Connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-anthracite hover:bg-terracotta text-white rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Connexion Sécurisée</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Note (No secret password displayed) */}
          <div className="mt-6 pt-5 border-t border-stone/10 flex items-center justify-center gap-2 text-xs text-stone">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Chiffrement SSL • Protection anti-intrusion active</span>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-stone hover:text-terracotta transition-colors underline underline-offset-4"
          >
            ← Retourner à la boutique publique
          </Link>
        </div>
      </div>
    </div>
  );
}
