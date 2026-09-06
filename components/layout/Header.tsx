'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { getCartCount, openDrawer, isDrawerOpen } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [badgeAnimating, setBadgeAnimating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const currentCount = getCartCount();

  useEffect(() => {
    if (currentCount !== prevCount) {
      setCartCount(currentCount);
      if (currentCount > prevCount) {
        setBadgeAnimating(true);
        setTimeout(() => setBadgeAnimating(false), 400);
      }
      setPrevCount(currentCount);
    } else {
      setCartCount(currentCount);
    }
  }, [currentCount, prevCount]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { href: '/?gender=femme', label: 'Femme' },
    { href: '/?gender=homme', label: 'Homme' },
    { href: '/?badge=Nouveau', label: 'Nouveautés' },
    { href: '/?badge=Promo', label: 'Promotions' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-stone/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-anthracite hover:text-terracotta transition-colors"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 md:gap-2.5 group transition-colors"
            >
              <div className="relative h-6 sm:h-7 md:h-8 aspect-[464/584] flex-shrink-0">
                <Image
                  src="/images/logo-em.png"
                  alt="ÉM Logo"
                  fill
                  sizes="(max-width: 768px) 32px, 40px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-anthracite group-hover:text-terracotta transition-colors tracking-tight sm:tracking-wide whitespace-nowrap">
                Elegance By Michou
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-anthracite hover:text-terracotta transition-colors tracking-wider uppercase"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Desktop search */}
              <div className="hidden md:flex items-center">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-48 text-sm border-b border-anthracite bg-transparent outline-none py-1 placeholder:text-stone"
                    />
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="text-stone hover:text-anthracite"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-anthracite hover:text-terracotta transition-colors"
                    aria-label="Rechercher"
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>

              {/* Mobile search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 text-anthracite hover:text-terracotta transition-colors"
                aria-label="Rechercher"
              >
                <Search size={20} />
              </button>

              {/* Cart button */}
              <button
                onClick={openDrawer}
                className="relative p-2 text-anthracite hover:text-terracotta transition-colors"
                aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 bg-terracotta text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-transform ${badgeAnimating ? 'animate-badge-pop' : ''}`}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone/10 bg-ivory">
            <nav className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-anthracite hover:text-terracotta transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Mobile search overlay */}
        {searchOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-ivory/98 backdrop-blur-sm flex items-start pt-20 px-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex items-center gap-3 border-b-2 border-anthracite pb-2">
                <Search size={20} className="text-stone" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Que cherchez-vous ?"
                  className="flex-1 text-lg bg-transparent outline-none placeholder:text-stone"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="text-stone hover:text-anthracite"
                >
                  <X size={24} />
                </button>
              </div>
            </form>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
