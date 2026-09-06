'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import PlaceholderProductImage from './PlaceholderProductImage';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, openDrawer } = useCart();
  const searchParams = useSearchParams();
  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);
  const hasColors = Boolean(product.colors && product.colors.length > 0);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0]?.name || '');
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Reset selected size whenever URL search params or product change
  useEffect(() => {
    setSelectedSize('');
  }, [searchParams, product.id]);

  const hasImages = product.images && product.images.length > 0;
  const hoverImage = product.hoverImage || (product.images && product.images.length > 1 ? product.images[1] : undefined);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) return;
    addToCart(product, selectedSize, selectedColor || product.colors?.[0]?.name || '');
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      openDrawer();
    }, 1500);
  };

  const displayPrice = product.originalPrice ? (
    <div className="flex items-baseline gap-2">
      <span className="font-semibold text-terracotta">{formatPrice(product.price)}</span>
      <span className="text-xs text-stone line-through">{formatPrice(product.originalPrice)}</span>
    </div>
  ) : (
    <span className="font-semibold text-anthracite">{formatPrice(product.price)}</span>
  );

  const isAddToCartReady = hasSizes && selectedSize !== '';

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link href={`/produits/${product.id}`} className="relative block overflow-hidden bg-stone/10 aspect-[3/4]">
        {hasImages ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                hoverImage && isHovered ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${product.name} - vue alternative`}
                fill
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                  isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            )}
          </>
        ) : (
          <PlaceholderProductImage />
        )}

        {/* Badge — only show for Promo or special badges, not Nouveau */}
        {product.badge && product.badge !== 'Nouveau' && (
          <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 tracking-wider uppercase ${
            product.badge === 'Promo'
              ? 'bg-terracotta text-white'
              : 'bg-anthracite text-ivory'
          }`}>
            {product.badge === 'Promo' && product.discount ? `-${product.discount}%` : product.badge}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="mt-3 flex-1 flex flex-col gap-2">
        <Link href={`/produits/${product.id}`}>
          <h3 className="text-sm font-medium text-anthracite hover:text-terracotta transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="text-sm">{displayPrice}</div>

        {/* Color selector */}
        {hasColors && (
          <div className="flex items-center gap-1.5">
            {product.colors.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color.name);
                }}
                title={color.name}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedColor === color.name
                    ? 'border-anthracite scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              />
            ))}
          </div>
        )}

        {/* Size selector */}
        {hasSizes && (
          <div className="flex flex-wrap gap-1">
            {product.sizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(prev => (prev === size ? '' : size));
                }}
                className={`text-xs px-2 py-1 border transition-colors ${
                  selectedSize === size
                    ? 'border-anthracite bg-anthracite text-ivory'
                    : 'border-stone/30 text-stone hover:border-anthracite hover:text-anthracite'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Button: Voir le produit OR Ajouter au panier */}
        {isAddToCartReady ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`mt-auto w-full py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
              addedToCart
                ? 'bg-green-600 text-white'
                : 'bg-anthracite text-ivory hover:bg-terracotta'
            }`}
          >
            {addedToCart ? (
              <><Check size={14} /> Ajouté !</>
            ) : (
              <><ShoppingBag size={14} /> Ajouter au panier</>
            )}
          </button>
        ) : (
          <Link
            href={`/produits/${product.id}`}
            className="mt-auto w-full py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 bg-anthracite text-ivory hover:bg-terracotta text-center"
          >
            Voir le produit
          </Link>
        )}
      </div>
    </div>
  );
}
