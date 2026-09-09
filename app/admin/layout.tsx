'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  ExternalLink,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Si on est sur la page de login, on affiche uniquement le formulaire sans layout admin
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/produits', label: 'Catalogue & Prix', icon: Package },
    { href: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
    { href: '/admin/finances', label: 'Finances & Bilan', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col md:flex-row text-anthracite font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 bg-anthracite text-ivory flex-col justify-between shrink-0 shadow-xl z-20">
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-8 h-8 aspect-square rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo-em.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-lg font-semibold tracking-wide block leading-tight text-white">
                  Élégance Admin
                </span>
                <span className="text-[10px] text-terracotta tracking-widest uppercase font-semibold">
                  Espace Gestionnaire
                </span>
              </div>
            </Link>
          </div>

          {/* Action rapide : Ajouter produit */}
          <div className="px-4 pt-6 pb-2">
            <Link
              href="/admin/produits/nouveau"
              className="w-full flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
            >
              <PlusCircle size={16} />
              Nouveau Produit
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-xs'
                      : 'text-stone hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-terracotta' : 'text-stone'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs text-stone hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              Boutique en ligne
            </span>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-ivory/80">Public</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden bg-anthracite text-white sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 shadow-md">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 aspect-square rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            <Image
              src="/images/logo-em.png"
              alt="Logo"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <span className="font-serif text-base font-semibold text-white">Élégance Admin</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/produits/nouveau"
            className="bg-terracotta p-2 rounded-lg text-white"
            title="Ajouter un produit"
          >
            <PlusCircle size={18} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone hover:text-white"
            aria-label="Menu Admin"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu Déroulant Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-anthracite text-white px-4 py-3 border-b border-white/10 shadow-lg z-20 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  isActive ? 'bg-white/15 text-white font-bold' : 'text-stone hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-terracotta' : ''} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-stone">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 py-2">
              <ExternalLink size={14} />
              Voir la boutique
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 py-2 text-red-400 hover:text-red-300"
            >
              <LogOut size={14} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
