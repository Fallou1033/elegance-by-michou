'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Ruler, ChevronLeft, ChevronRight, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import SizeGuideModal from '@/components/ui/SizeGuideModal';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id || p.slug === params.id);
  if (!product) notFound();

  const { addToCart, openDrawer } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const sizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // With 6 products in total, pick from the other 5 products regardless of category/gender
  const currentIndex = products.findIndex(p => p.id === product.id || p.slug === product.id);
  const otherProducts = [
    ...products.slice(currentIndex + 1),
    ...products.slice(0, currentIndex >= 0 ? currentIndex : 0),
  ].filter(p => p.id !== product.id && p.slug !== product.slug);
  const relatedProducts = otherProducts.slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      if (sizeTimeoutRef.current) clearTimeout(sizeTimeoutRef.current);
      sizeTimeoutRef.current = setTimeout(() => setSizeError(false), 5000);
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      openDrawer();
    }, 1200);
  };

  const hasImages = product.images.length > 0;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          {/* Main image — capped on mobile (60vh / max 440px), original aspect ratio on desktop */}
          <div className="relative h-[60vh] max-h-[440px] md:h-auto md:max-h-none md:aspect-[3/4] w-full bg-stone/10 overflow-hidden rounded-xs shadow-2xs">
            {hasImages ? (
              <>
                <Image
                  src={product.images[selectedImage]}
                  alt={`${product.name} - Vue ${selectedImage + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.badge && product.badge !== 'Nouveau' && (
                  <span className={`absolute top-4 left-4 text-xs font-medium px-2 py-1 tracking-wider uppercase z-10 ${
                    product.badge === 'Promo' ? 'bg-terracotta text-white' : 'bg-anthracite text-ivory'
                  }`}>
                    {product.badge === 'Promo' && product.discount ? `-${product.discount}%` : product.badge}
                  </span>
                )}

                {/* Mobile gallery navigation arrows */}
                {hasImages && product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                      }}
                      className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs z-20 transition-colors"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                      }}
                      className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs z-20 transition-colors"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Mobile overlay: Product name, price and gallery position indicator */}
                <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-14 pb-3.5 px-4 flex items-end justify-between gap-3 pointer-events-none z-10">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-ivory/80 uppercase tracking-widest font-medium mb-0.5 truncate">
                      {product.gender === 'homme' ? 'Homme' : product.gender === 'unisexe' ? 'Unisexe' : 'Femme'} · {product.categoryLabel || product.category}
                    </p>
                    <h1 className="font-serif text-lg sm:text-xl font-semibold text-white leading-tight line-clamp-2 drop-shadow-xs">
                      {product.name}
                    </h1>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white drop-shadow-xs">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-ivory/70 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gallery position indicator */}
                  {hasImages && product.images.length > 1 && (
                    <div className="flex-shrink-0 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-white tracking-wider border border-white/20 shadow-xs">
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
                {/* Mobile overlay for placeholder */}
                <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-14 pb-3.5 px-4 flex items-end justify-between gap-3 pointer-events-none z-10">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-ivory/80 uppercase tracking-widest font-medium mb-0.5 truncate">
                      {product.gender === 'homme' ? 'Homme' : product.gender === 'unisexe' ? 'Unisexe' : 'Femme'} · {product.categoryLabel || product.category}
                    </p>
                    <h1 className="font-serif text-lg sm:text-xl font-semibold text-white leading-tight line-clamp-2 drop-shadow-xs">
                      {product.name}
                    </h1>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white drop-shadow-xs">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Thumbnails — single horizontal scroll row on mobile, wrapped on desktop */}
          {hasImages && product.images.length > 1 && (
            <div className="flex overflow-x-auto md:flex-wrap gap-2 pt-1 pb-1 no-scrollbar scroll-smooth">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-14 md:w-16 aspect-[3/4] flex-shrink-0 bg-stone/10 overflow-hidden border-2 transition-all duration-150 ${
                    selectedImage === i ? 'border-anthracite shadow-sm scale-105' : 'border-transparent hover:border-stone/40'
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
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Desktop-only title & price (on mobile it is cleanly overlaid on the photo) */}
          <div className="hidden md:block">
            <p className="text-xs text-stone uppercase tracking-widest mb-1">
              {product.gender === 'homme' ? 'Homme' : product.gender === 'unisexe' ? 'Unisexe' : 'Femme'} · {product.categoryLabel || product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-anthracite">{product.name}</h1>
            <div className="mt-3">
              {product.originalPrice ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-terracotta">{formatPrice(product.price)}</span>
                  <span className="text-base text-stone line-through">{formatPrice(product.originalPrice)}</span>
                  {product.discount && (
                    <span className="text-sm bg-terracotta/10 text-terracotta px-2 py-0.5 font-medium">
                      -{product.discount}%
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-2xl font-bold text-anthracite">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>

          <p className="text-stone leading-relaxed">{product.description}</p>

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
            <p className="text-xs font-semibold uppercase tracking-wider text-anthracite mb-2">Quantité</p>
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
          </div>

          {/* Add to cart - desktop */}
          <div className="hidden md:flex flex-col gap-2">
            {sizeError && (
              <div className="py-2.5 px-4 bg-red-600 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-2 shadow-md animate-bounce">
                <AlertCircle size={16} />
                <span>Veuillez sélectionner une taille</span>
              </div>
            )}
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-3 w-full py-4 text-sm font-medium tracking-widest uppercase transition-all duration-200 ${
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
                  {`Ajouter au panier — ${formatPrice(product.price * quantity)}`}
                </>
              )}
            </button>
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
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer text-sm font-medium py-2 hover:text-terracotta transition-colors">
                Entretien
                <span className="text-stone group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-stone mt-2 leading-relaxed">{product.care}</p>
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
        <button
          onClick={handleAddToCart}
          className={`w-full py-4 text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-200 ${
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
              <span>Veuillez sélectionner une taille</span>
            </>
          ) : addedToCart ? (
            <>
              <ShoppingBag size={18} />
              <span>Ajouté au panier !</span>
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              <span>Ajouter — {formatPrice(product.price * quantity)}</span>
            </>
          )}
        </button>
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
