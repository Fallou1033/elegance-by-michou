'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Ruler, ChevronLeft, ChevronRight, ArrowRight, AlertCircle, Maximize2, X, Heart } from 'lucide-react';
import Link from 'next/link';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { formatPrice, BULK_DISCOUNT_RULES } from '@/lib/utils';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import ProductCard from '@/components/ui/ProductCard';

import { Product } from '@/types';

function matchesProductSlug(p: Product, targetId: string) {
  if (p.id === targetId || p.slug === targetId) return true;
  const pNorm = (p.slug || p.id || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const tNorm = targetId.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (pNorm === tNorm) return true;
  if (tNorm.includes('lin') && tNorm.includes('femme') && pNorm.includes('lin') && pNorm.includes('femme')) {
    return true;
  }
  return false;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const initialProduct = products.find(p => matchesProductSlug(p, params.id));
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [loading, setLoading] = useState(!initialProduct);

  const { addToCart, openDrawer } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(initialProduct?.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const sizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let hasLocalOverride = false;
    try {
      const cached = localStorage.getItem('admin_local_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const localFound = parsed.find((p: Product) => matchesProductSlug(p, params.id));
          if (localFound) {
            setProduct(localFound);
            hasLocalOverride = true;
            setLoading(false);
          }
        }
      }
    } catch {}

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          let mergedList = data.products;
          try {
            const cached = localStorage.getItem('admin_local_products');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const map = new Map<string, Product>();
                mergedList.forEach((p: Product) => map.set(p.id, p));
                parsed.forEach((p: Product) => map.set(p.id, p));
                mergedList = Array.from(map.values());
              }
            }
          } catch {}

          setAllProducts(mergedList);

          const found = mergedList.find((p: Product) => matchesProductSlug(p, params.id));
          if (found) {
            // Si on a un override local, on garde la version locale prioritaire
            if (!hasLocalOverride) {
              setProduct(found);
            }
            setSelectedColor(prev => {
              if (prev && found.colors?.some((c: any) => c.name === prev)) return prev;
              return found.colors?.[0]?.name || '';
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  // Fullscreen keyboard navigation and scroll lock
  useEffect(() => {
    if (!isFullscreenOpen || !product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
      } else if (e.key === 'ArrowLeft' && product.images && product.images.length > 1) {
        setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight' && product.images && product.images.length > 1) {
        setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreenOpen, product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-3 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        <p className="text-sm text-stone font-medium">Chargement de votre article...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="font-serif text-2xl font-semibold text-anthracite">Article introuvable</h1>
        <p className="text-stone text-sm max-w-md">
          Cet article n&apos;est plus disponible ou le lien est incorrect.
        </p>
        <Link
          href="/#catalogue"
          className="mt-2 px-6 py-3 bg-terracotta text-white text-xs font-semibold uppercase tracking-wider hover:bg-terracotta/90 transition-colors"
        >
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(product.id);
  const bulkRule = BULK_DISCOUNT_RULES[product.id];

  // With products list, pick from the other products regardless of category/gender
  const currentIndex = allProducts.findIndex(p => p.id === product.id || p.slug === product.id);
  const otherProducts = [
    ...allProducts.slice(currentIndex + 1),
    ...allProducts.slice(0, currentIndex >= 0 ? currentIndex : 0),
  ].filter(p => p.id !== product.id && p.slug !== product.slug);
  const relatedProducts = otherProducts.slice(0, 4);

  const isBulkDiscountEligible = !!bulkRule && quantity >= bulkRule.minQty;
  const currentUnitPrice = isBulkDiscountEligible ? bulkRule.discountedPrice : product.price;
  const totalPriceForQuantity = currentUnitPrice * quantity;
  const totalSavingsForQuantity = (product.price - currentUnitPrice) * quantity;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      if (sizeTimeoutRef.current) clearTimeout(sizeTimeoutRef.current);
      sizeTimeoutRef.current = setTimeout(() => setSizeError(false), 5000);
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, selectedColor || product.colors?.[0]?.name || '', quantity);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      openDrawer();
    }, 1200);
  };

  const hasImages = Boolean(product.images && product.images.length > 0 && product.images[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-32 md:py-16 md:pb-20">
      {/* Breadcrumb / Retour */}
      <nav className="mb-3 md:mb-8">
        <Link
          href="/#catalogue"
          className="inline-flex items-center gap-2 text-stone text-sm font-medium hover:text-terracotta transition-colors py-1.5 px-2 -ml-2 rounded-md hover:bg-stone/10 w-fit group"
        >
          <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Retour à la boutique</span>
        </Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          {/* Main image — edge-to-edge coverage, no vertical bands, top-anchored so head is never cut */}
          <div
            onClick={() => setIsFullscreenOpen(true)}
            className="relative h-[60vh] max-h-[440px] md:h-[520px] md:max-h-[560px] w-full bg-stone/10 overflow-hidden rounded-xs shadow-2xs cursor-zoom-in group"
          >
            {hasImages ? (
              <>
                <img
                  key={`main-img-${selectedImage}`}
                  src={product.images[selectedImage]}
                  alt={`${product.name} - Vue ${selectedImage + 1}`}
                  className="w-full h-full object-cover object-top transition-opacity duration-300"
                />
                {product.badge && product.badge !== 'Nouveau' && (
                  <span className={`absolute top-4 left-4 text-xs font-medium px-2 py-1 tracking-wider uppercase z-10 ${
                    product.badge === 'Promo' ? 'bg-terracotta text-white' : 'bg-anthracite text-ivory'
                  }`}>
                    {product.badge === 'Promo' && product.discount ? `-${product.discount}%` : product.badge}
                  </span>
                )}

                {/* Favorite heart button on main image */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className={`absolute top-3.5 right-13 md:right-14 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center backdrop-blur-xs z-20 transition-all cursor-pointer shadow-md hover:scale-105 ${
                    favorited
                      ? 'bg-white text-red-500'
                      : 'bg-black/40 hover:bg-black/70 text-white'
                  }`}
                  aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart size={16} className={favorited ? 'fill-red-500 text-red-500' : ''} />
                </button>

                {/* Fullscreen expand button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreenOpen(true);
                  }}
                  className="absolute top-3.5 right-3.5 w-8 h-8 md:w-9 md:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs z-20 transition-all cursor-pointer shadow-md hover:scale-105"
                  aria-label="Afficher en plein écran"
                  title="Agrandir en plein écran"
                >
                  <Maximize2 size={16} />
                </button>

                {/* Gallery navigation arrows (visible on mobile & desktop) */}
                {hasImages && product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs z-20 transition-all cursor-pointer shadow-md"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs z-20 transition-all cursor-pointer shadow-md"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Overlay: Product name, price and gallery position indicator (mobile & desktop) */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-16 pb-4 px-4 md:px-5 flex items-end justify-between gap-3 pointer-events-none z-10">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] md:text-xs text-ivory/80 uppercase tracking-widest font-medium mb-0.5 truncate">
                      {product.gender === 'homme' ? 'Homme' : product.gender === 'unisexe' ? 'Unisexe' : 'Femme'} · {product.categoryLabel || product.category}
                    </p>
                    <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight line-clamp-2 drop-shadow-xs">
                      {product.name}
                    </h1>
                    <div className="mt-1 flex items-baseline gap-2.5">
                      <span className="text-lg md:text-xl font-bold text-white drop-shadow-xs">
                        {formatPrice(currentUnitPrice)}
                      </span>
                      {product.originalPrice ? (
                        <span className="text-xs md:text-sm text-ivory/70 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      ) : isBulkDiscountEligible ? (
                        <span className="text-xs md:text-sm text-ivory/70 line-through">
                          {formatPrice(product.price)}
                        </span>
                      ) : null}
                      {product.discount ? (
                        <span className="text-xs bg-terracotta text-white px-1.5 py-0.5 font-medium rounded-xs">
                          -{product.discount}%
                        </span>
                      ) : isBulkDiscountEligible ? (
                        <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 font-medium rounded-xs">
                          Tarif volume
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Gallery position indicator */}
                  {hasImages && product.images.length > 1 && (
                    <div className="flex-shrink-0 bg-black/60 backdrop-blur-xs px-2.5 md:px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold text-white tracking-wider border border-white/20 shadow-xs">
                      {selectedImage + 1} / {product.images.length}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Placeholder */}
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#F0EDE8] gap-3 select-none">
                  <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M24 10C21.8 10 20 11.8 20 14C20 15.1 20.4 16.1 21.1 16.8L10 22V26H16V42H32V26H38V22L26.9 16.8C27.6 16.1 28 15.1 28 14C28 11.8 26.2 10 24 10Z" stroke="#8C8C88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <circle cx="24" cy="14" r="2" fill="#8C8C88" opacity="0.5" />
                  </svg>
                  <span className="text-sm font-medium text-stone tracking-wide uppercase">Photo à venir</span>
                </div>
                {product.badge && product.badge !== 'Nouveau' && (
                  <span className={`absolute top-4 left-4 text-xs font-medium px-2 py-1 tracking-wider uppercase z-10 ${
                    product.badge === 'Promo' ? 'bg-terracotta text-white' : 'bg-anthracite text-ivory'
                  }`}>
                    {product.badge === 'Promo' && product.discount ? `-${product.discount}%` : product.badge}
                  </span>
                )}
                {/* Overlay for placeholder */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-16 pb-4 px-4 md:px-5 flex items-end justify-between gap-3 pointer-events-none z-10">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] md:text-xs text-ivory/80 uppercase tracking-widest font-medium mb-0.5 truncate">
                      {product.gender === 'homme' ? 'Homme' : product.gender === 'unisexe' ? 'Unisexe' : 'Femme'} · {product.categoryLabel || product.category}
                    </p>
                    <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-white leading-tight line-clamp-2 drop-shadow-xs">
                      {product.name}
                    </h1>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-lg md:text-xl font-bold text-white drop-shadow-xs">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Thumbnails — single horizontal scroll row on both mobile and desktop */}
          {hasImages && product.images.length > 1 && (
            <div className="flex overflow-x-auto gap-2 pt-1 pb-1 no-scrollbar scroll-smooth">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-14 md:w-16 aspect-[3/4] flex-shrink-0 bg-stone/10 overflow-hidden border-2 transition-all duration-150 rounded-xs ${
                    selectedImage === i ? 'border-anthracite shadow-sm scale-105 ring-1 ring-anthracite' : 'border-transparent hover:border-stone/40 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Afficher vue ${i + 1}`}
                >
                  <Image src={img} alt={`Vue ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4 md:gap-5">
          <p className="text-stone leading-relaxed text-sm md:text-base">{product.description}</p>

          {/* Volume offer banner */}
          {bulkRule && (
            <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xs">
              <span className="text-2xl leading-none flex-shrink-0">✨</span>
              <div className="text-xs sm:text-sm space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-950">Offre spéciale volume &amp; revendeurs</span>
                  <span className="bg-amber-200 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    Plus de 5 articles
                  </span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  Pour plus de 5 articles achetés (dès 6 robes), le prix unitaire passe à{' '}
                  <strong className="text-terracotta font-bold text-sm sm:text-base">{formatPrice(bulkRule.discountedPrice)}</strong> au lieu de{' '}
                  <span className="line-through text-stone">{formatPrice(bulkRule.normalPrice)}</span> !
                </p>
                {quantity < bulkRule.minQty ? (
                  <p className="text-[11px] sm:text-xs text-amber-800 font-medium">
                    💡 Sélectionnez {bulkRule.minQty} pièces ou plus pour profiter de 2 000 FCFA de remise par robe.
                  </p>
                ) : (
                  <p className="text-[11px] sm:text-xs text-green-700 font-bold flex items-center gap-1">
                    <span>✓</span> Remise volume activée : {formatPrice(totalSavingsForQuantity)} d&apos;économie immédiate !
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Color selector */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-anthracite mb-2">
              Couleur : <span className="font-normal text-stone normal-case tracking-normal">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-2.5 items-center">
              {product.colors.map(color => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                    selectedColor === color.name
                      ? 'border-anthracite scale-110 shadow-md ring-2 ring-anthracite/20'
                      : 'border-stone/25 hover:border-stone/60 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div
            ref={sizeSectionRef}
            className={`scroll-mt-28 p-3 -m-3 rounded-xl transition-all duration-300 ${
              sizeError ? 'bg-red-50 ring-2 ring-red-400' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-anthracite flex items-center gap-2">
                <span>Taille</span>
                {sizeError && (
                  <span className="text-red-600 font-bold normal-case tracking-normal flex items-center gap-1 animate-pulse">
                    <AlertCircle size={13} />
                    Veuillez sélectionner une taille
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="flex items-center gap-1 text-xs text-stone hover:text-terracotta transition-colors"
              >
                <Ruler size={12} />
                Guide des tailles
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  className={`min-w-[44px] h-11 px-3 border text-sm transition-all duration-150 font-medium ${
                    selectedSize === size
                      ? 'border-anthracite bg-anthracite text-ivory'
                      : sizeError
                      ? 'border-red-400 bg-white text-anthracite hover:border-red-600 hover:bg-red-50'
                      : 'border-stone/30 text-anthracite hover:border-anthracite'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-anthracite">Quantité</p>
              {bulkRule && quantity < bulkRule.minQty && (
                <button
                  type="button"
                  onClick={() => setQuantity(bulkRule.minQty)}
                  className="text-xs text-terracotta font-medium hover:underline flex items-center gap-1"
                >
                  <span>Passer à {bulkRule.minQty} robes (11 000 FCFA/u)</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-0 border border-stone/30 w-fit">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-stone/10 transition-colors"
                aria-label="Diminuer la quantité"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 h-10 flex items-center justify-center text-sm font-medium border-x border-stone/30">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-stone/10 transition-colors"
                aria-label="Augmenter la quantité"
              >
                <Plus size={14} />
              </button>
            </div>
            {isBulkDiscountEligible && (
              <p className="text-xs text-green-700 font-medium mt-1.5 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600"></span>
                <span>Tarif volume appliqué : {formatPrice(currentUnitPrice)} × {quantity} = {formatPrice(totalPriceForQuantity)}</span>
              </p>
            )}
          </div>

          {/* Add to cart - desktop */}
          <div className="hidden md:flex flex-col gap-2">
            {sizeError && (
              <div className="py-2.5 px-4 bg-red-600 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-2 shadow-md animate-bounce">
                <AlertCircle size={16} />
                <span>Veuillez sélectionner une taille</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-sm font-medium tracking-widest uppercase transition-all duration-200 ${
                  sizeError
                    ? 'bg-red-600 text-white shadow-lg'
                    : addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-anthracite text-ivory hover:bg-terracotta'
                }`}
              >
                {sizeError ? (
                  <>
                    <AlertCircle size={18} />
                    Veuillez sélectionner une taille
                  </>
                ) : addedToCart ? (
                  'Ajouté au panier !'
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>{`Ajouter au panier — ${formatPrice(totalPriceForQuantity)}`}</span>
                    {totalSavingsForQuantity > 0 && (
                      <span className="bg-terracotta text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-1 normal-case tracking-normal">
                        -{formatPrice(totalSavingsForQuantity)}
                      </span>
                    )}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`h-[54px] w-[54px] flex-shrink-0 flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                  favorited
                    ? 'border-red-500 bg-red-50 text-red-500 shadow-xs'
                    : 'border-stone/30 text-stone hover:border-anthracite hover:text-red-500 hover:bg-stone/5'
                }`}
                aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart size={22} className={favorited ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>
          </div>

          {/* Product details */}
          <div className="border-t border-stone/20 pt-6 space-y-3">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer text-sm font-medium py-2 hover:text-terracotta transition-colors">
                Matière & Composition
                <span className="text-stone group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-stone mt-2 leading-relaxed">{product.material}</p>
            </details>
            <div className="py-2">
              <p className="text-sm text-stone">🚚 Livraison partout au Sénégal — gratuite dès 70 000 FCFA d&apos;achat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related products / Discover more pieces */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 md:mt-24 pt-12 border-t border-stone/20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-terracotta text-xs font-semibold uppercase tracking-[0.25em] mb-2">
                Collection Elegance By Michou
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-anthracite">
                Découvrez aussi nos autres pièces
              </h2>
            </div>
            <Link
              href="/#catalogue"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-anthracite hover:text-terracotta transition-colors"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Second clear exit point to full catalogue */}
          <div className="mt-12 text-center">
            <Link
              href="/#catalogue"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-anthracite text-ivory text-xs md:text-sm font-semibold tracking-widest uppercase hover:bg-terracotta transition-colors duration-200 shadow-xs"
            >
              <span>Voir tous nos articles</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-ivory/95 backdrop-blur-md border-t border-stone/20 p-4 shadow-2xl">
        {sizeError && (
          <div className="mb-2.5 py-2.5 px-4 bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xl animate-bounce">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>Veuillez sélectionner une taille</span>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-4 text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-200 ${
              sizeError
                ? 'bg-red-600 text-white shadow-lg'
                : addedToCart
                ? 'bg-green-600 text-white'
                : 'bg-anthracite text-ivory active:scale-[0.99]'
            }`}
          >
            {sizeError ? (
              <>
                <AlertCircle size={18} />
                <span>Sélectionner une taille</span>
              </>
            ) : addedToCart ? (
              <>
                <ShoppingBag size={18} />
                <span>Ajouté !</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span className="truncate">Ajouter — {formatPrice(totalPriceForQuantity)}</span>
                {totalSavingsForQuantity > 0 && (
                  <span className="bg-terracotta text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 normal-case tracking-normal">
                    -{formatPrice(totalSavingsForQuantity)}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            className={`h-[52px] w-[52px] flex-shrink-0 flex items-center justify-center border transition-all duration-200 cursor-pointer rounded-xs ${
              favorited
                ? 'border-red-500 bg-red-50 text-red-500'
                : 'border-stone/30 bg-white text-stone active:scale-95'
            }`}
            aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart size={22} className={favorited ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Fullscreen Lightbox Modal */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Mode plein écran"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 text-white z-30">
            <div className="flex items-center gap-3">
              <span className="font-serif text-base sm:text-xl font-semibold text-white line-clamp-1">
                {product.name}
              </span>
              <span className="text-xs bg-white/15 px-3 py-1 rounded-full text-white font-medium tracking-wider">
                {selectedImage + 1} / {product.images.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenOpen(false)}
              className="p-2 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-2 text-xs sm:text-sm font-medium"
              aria-label="Fermer le plein écran"
            >
              <X size={20} />
              <span className="hidden sm:inline">Fermer</span>
            </button>
          </div>

          {/* Center Main Image Viewport */}
          <div className="relative flex-1 w-full h-full flex items-center justify-center p-3 sm:p-8 overflow-hidden">
            {/* Left arrow */}
            {product.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                }}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md z-30 transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
                aria-label="Photo précédente"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {/* Main high-res picture with object-contain */}
            <div className="flex items-center justify-center w-full h-full max-w-6xl max-h-[82vh]">
              <img
                key={`fullscreen-img-${selectedImage}`}
                src={product.images[selectedImage]}
                alt={`${product.name} - Plein écran ${selectedImage + 1}`}
                className="max-w-full max-h-[82vh] w-auto h-auto object-contain drop-shadow-2xl select-none"
              />
            </div>

            {/* Right arrow */}
            {product.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md z-30 transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
                aria-label="Photo suivante"
              >
                <ChevronRight size={30} />
              </button>
            )}
          </div>

          {/* Bottom thumbnails strip */}
          {product.images.length > 1 && (
            <div className="px-4 py-3 bg-black/60 border-t border-white/10 z-30">
              <div className="flex justify-center overflow-x-auto gap-2.5 max-w-4xl mx-auto no-scrollbar py-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-12 sm:w-16 aspect-[3/4] flex-shrink-0 bg-white/10 overflow-hidden border-2 transition-all duration-150 rounded-xs ${
                      selectedImage === i
                        ? 'border-white scale-105 ring-2 ring-white shadow-lg'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`Photo ${i + 1}`}
                  >
                    <Image src={img} alt={`Miniature ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
