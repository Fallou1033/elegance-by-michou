'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ShoppingBag, Search, Menu, X, Heart, Instagram } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { products, INSTAGRAM_URL } from '@/data/products';
import { formatPrice } from '@/lib/utils';

export default function Header() {
  const { getCartCount, openDrawer, isDrawerOpen } = useCart();
  const { getFavoritesCount } = useFavorites();
  const [cartCount, setCartCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [badgeAnimating, setBadgeAnimating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentCount = getCartCount();
  const favCount = getFavoritesCount();

  // Instant live search suggestions
  const liveResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery]);

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

  // Click outside search container to close dropdown on desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        // Only clear if empty, or keep open
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const q = query.toLowerCase();
    // Check if there is an exact or single product match
    const matched = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryLabel?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );

    // If exactly 1 matching product, send customer DIRECTLY to this product!
    if (matched.length === 1) {
      router.push(`/produits/${matched[0].id}`);
      setSearchOpen(false);
      setSearchQuery('');
      return;
    }

    // Otherwise, direct scroll to catalogue with search results
    router.push(`/?search=${encodeURIComponent(query)}#catalogue`);
    setSearchOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      setTimeout(() => {
        const catalogueEl = document.getElementById('catalogue');
        if (catalogueEl) {
          catalogueEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    }
  };

  const navLinks = [
    { href: '/?gender=femme#catalogue', label: 'Femme' },
    { href: '/?gender=homme#catalogue', label: 'Homme' },
    { href: '/?badge=Nouveau#catalogue', label: 'Nouveautés' },
    { href: '/?badge=Promo#catalogue', label: 'Promotions' },
    { href: '/favoris', label: 'Favoris' },
    { href: '/a-propos', label: 'À Propos' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/favoris') || href.startsWith('/a-propos')) {
      return;
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      router.push(href);
      setTimeout(() => {
        const catalogueEl = document.getElementById('catalogue');
        if (catalogueEl) {
          catalogueEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/favoris') || href.startsWith('/a-propos')) {
      return;
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      router.push(href);
      setTimeout(() => {
        const catalogueEl = document.getElementById('catalogue');
        if (catalogueEl) {
          catalogueEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-stone/10">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-1 sm:gap-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-md text-anthracite hover:text-terracotta transition-colors flex-shrink-0"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 group transition-colors min-w-0 flex-shrink"
            >
              <div className="relative h-6 sm:h-7 md:h-8 aspect-[464/584] flex-shrink-0">
                <Image
                  src="/images/logo-em.png"
                  alt="ÉM Logo"
                  fill
                  sizes="(max-width: 768px) 26px, 40px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-serif text-[15px] sm:text-xl md:text-2xl font-semibold text-anthracite group-hover:text-terracotta transition-colors tracking-tight sm:tracking-wide truncate">
                Elegance By Michou
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-anthracite hover:text-terracotta transition-colors tracking-wider uppercase flex items-center gap-1.5"
                >
                  <span>{link.label}</span>
                  {link.label === 'Favoris' && favCount > 0 && (
                    <span className="text-[11px] bg-terracotta text-white font-bold px-1.5 py-0.2 rounded-full leading-tight">
                      {favCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2.5 md:gap-4 flex-shrink-0">
              {/* Desktop search */}
              <div ref={searchContainerRef} className="hidden md:flex items-center relative">
                {searchOpen ? (
                  <>
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un vêtement..."
                        className="w-56 text-sm border-b border-anthracite bg-transparent outline-none py-1 placeholder:text-stone"
                      />
                      <button
                        type="button"
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="text-stone hover:text-anthracite cursor-pointer"
                        aria-label="Fermer la recherche"
                      >
                        <X size={16} />
                      </button>
                    </form>

                    {/* Instant suggestions dropdown */}
                    {liveResults.length > 0 && (
                      <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-stone/20 rounded-md shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone bg-stone/5 border-b border-stone/10 flex justify-between items-center">
                          <span>Suggestions ({liveResults.length})</span>
                          <span className="text-[9px] lowercase font-normal text-stone/80">cliquez pour ouvrir</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-stone/10">
                          {liveResults.map(p => (
                            <Link
                              key={p.id}
                              href={`/produits/${p.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center gap-3 p-2.5 hover:bg-stone/5 transition-colors group/item"
                            >
                              <div className="relative w-10 h-12 bg-stone/10 rounded-xs overflow-hidden flex-shrink-0">
                                {p.images?.[0] && (
                                  <Image
                                    src={p.images[0]}
                                    alt={p.name}
                                    fill
                                    className="object-cover group-hover/item:scale-105 transition-transform"
                                    sizes="40px"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-anthracite group-hover/item:text-terracotta truncate transition-colors">
                                  {p.name}
                                </p>
                                <p className="text-xs font-semibold text-terracotta mt-0.5">
                                  {formatPrice(p.price)}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleSearch}
                          className="w-full py-2 text-center text-xs font-semibold text-anthracite hover:text-terracotta bg-stone/5 border-t border-stone/10 transition-colors cursor-pointer"
                        >
                          Voir tous les résultats →
                        </button>
                      </div>
                    )}
                  </>
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
                className="md:hidden p-1.5 sm:p-2 text-anthracite hover:text-terracotta transition-colors"
                aria-label="Rechercher"
              >
                <Search size={19} className="sm:w-5 sm:h-5" />
              </button>

              {/* Instagram link */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex p-2 text-anthracite hover:text-[#E1306C] transition-colors"
                aria-label="Instagram Elegance By Michou"
                title="Suivre @elegance_by_michou sur Instagram"
              >
                <Instagram size={20} />
              </a>

              {/* Favorites button */}
              <Link
                href="/favoris"
                className="relative p-1.5 sm:p-2 text-anthracite hover:text-terracotta transition-colors"
                aria-label={`Favoris (${favCount} article${favCount > 1 ? 's' : ''})`}
                title="Mes favoris"
              >
                <Heart size={20} className={`sm:w-[21px] sm:h-[21px] ${favCount > 0 ? "fill-terracotta/20 text-terracotta" : ""}`} />
                {favCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 bg-terracotta text-white text-[9px] sm:text-[10px] font-bold rounded-full w-4 h-4 sm:w-4 sm:h-4 flex items-center justify-center transition-transform"
                  >
                    {favCount > 9 ? '9+' : favCount}
                  </span>
                )}
              </Link>

              {/* Cart button */}
              <button
                onClick={openDrawer}
                className="relative p-1.5 sm:p-2 text-anthracite hover:text-terracotta transition-colors"
                aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
              >
                <ShoppingBag size={21} className="sm:w-[22px] sm:h-[22px]" />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 bg-anthracite text-white text-[9px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center transition-transform ${badgeAnimating ? 'animate-badge-pop' : ''}`}
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
                  onClick={(e) => handleMobileNavClick(e, link.href)}
                  className="flex items-center justify-between text-base font-medium text-anthracite hover:text-terracotta transition-colors py-1"
                >
                  <span>{link.label}</span>
                  {link.label === 'Favoris' && favCount > 0 && (
                    <span className="bg-terracotta text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Heart size={11} className="fill-white" />
                      {favCount}
                    </span>
                  )}
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-stone/10">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-anthracite hover:text-[#E1306C] transition-colors py-1"
                >
                  <Instagram size={18} className="text-[#E1306C]" />
                  <span>Instagram @elegance_by_michou</span>
                </a>
              </div>
            </nav>
          </div>
        )}

        {/* Mobile search overlay */}
        {searchOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-ivory/98 backdrop-blur-md flex flex-col pt-16 px-6 overflow-y-auto">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex items-center gap-3 border-b-2 border-anthracite pb-2">
                <Search size={22} className="text-stone" />
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
                  className="text-stone hover:text-anthracite p-1 cursor-pointer"
                  aria-label="Fermer la recherche"
                >
                  <X size={24} />
                </button>
              </div>
            </form>

            {/* Mobile live results */}
            {liveResults.length > 0 && (
              <div className="mt-4 bg-white border border-stone/20 rounded-md shadow-xl overflow-hidden divide-y divide-stone/10">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone bg-stone/5">
                  Résultats instantanés ({liveResults.length})
                </div>
                {liveResults.map(p => (
                  <Link
                    key={p.id}
                    href={`/produits/${p.id}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-stone/5 transition-colors"
                  >
                    <div className="relative w-12 h-14 bg-stone/10 rounded-xs overflow-hidden flex-shrink-0">
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-anthracite truncate">
                        {p.name}
                      </p>
                      <p className="text-xs font-semibold text-terracotta mt-0.5">
                        {formatPrice(p.price)}
                      </p>
                      <p className="text-[11px] text-stone capitalize">
                        {p.gender} · {p.categoryLabel || p.category}
                      </p>
                    </div>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full py-3 text-center text-xs font-semibold text-anthracite hover:text-terracotta bg-stone/5 transition-colors cursor-pointer"
                >
                  Voir tous les résultats dans le catalogue →
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
