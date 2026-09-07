'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Ruler, ChevronLeft, ArrowRight } from 'lucide-react';
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
      setTimeout(() => setSizeError(false), 3000);
      return;
    }
    addToCart(product, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      openDrawer();
    }, 1200);
  };

  const hasImages = product.images.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-32 md:pb-20">
      {/* Breadcrumb / Retour */}
      <nav className="mb-6 md:mb-8">
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
          {/* Main image */}
          <div className="relative aspect-[3/4] bg-stone/10 overflow-hidden">
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
                  <span className={`absolute top-4 left-4 text-xs font-medium px-2 py-1 tracking-wider uppercase ${
                    product.badge === 'Promo' ? 'bg-terracotta text-white' : 'bg-anthracite text-ivory'
                  }`}>
                    {product.badge === 'Promo' && product.discount ? `-${product.discount}%` : product.badge}
                  </span>
                )}
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
                  <span className={`absolute top-4 left-4 text-xs font-medium px-2 py-1 tracking-wider uppercase ${
                    product.badge === 'Promo' ? 'bg-terracotta text-white' : 'bg-anthracite text-ivory'
                  }`}>
                    {product.badge === 'Promo' && product.discount ? `-${product.discount}%` : product.badge}
                  </span>
                )}
              </>
            )}
          </div>
          {/* Thumbnails — only shown when multiple real photos exist */}
          {hasImages && product.images.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-14 md:w-16 aspect-[3/4] bg-stone/10 overflow-hidden border-2 transition-all duration-150 ${
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
        <div className="flex flex-col gap-6">
          <div>
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
            <div className="flex gap-2">
              {product.colors.map(color => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                    selectedColor === color.name
                      ? 'border-anthracite scale-110 shadow-md'
                      : 'border-stone/20 hover:border-stone hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-anthracite">
                Taille {sizeError && <span className="text-red-500 normal-case tracking-normal"> — Veuillez sélectionner une taille</span>}
              </p>
              <button
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
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  className={`min-w-[44px] h-11 px-3 border text-sm transition-all duration-150 ${
                    selectedSize === size
                      ? 'border-anthracite bg-anthracite text-ivory font-medium'
                      : sizeError
                      ? 'border-red-400 text-anthracite hover:border-anthracite'
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
          <button
            onClick={handleAddToCart}
            className={`hidden md:flex items-center justify-center gap-3 w-full py-4 text-sm font-medium tracking-widest uppercase transition-all duration-200 ${
              addedToCart
                ? 'bg-green-600 text-white'
                : 'bg-anthracite text-ivory hover:bg-terracotta'
            }`}
          >
            <ShoppingBag size={18} />
            {addedToCart ? 'Ajouté au panier !' : `Ajouter au panier — ${formatPrice(product.price * quantity)}`}
          </button>

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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-ivory border-t border-stone/20 p-4">
        <button
          onClick={handleAddToCart}
          className={`w-full py-4 text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-200 ${
            addedToCart
              ? 'bg-green-600 text-white'
              : 'bg-anthracite text-ivory'
          }`}
        >
          <ShoppingBag size={18} />
          {addedToCart ? 'Ajouté au panier !' : `Ajouter — ${formatPrice(product.price * quantity)}`}
        </button>
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
