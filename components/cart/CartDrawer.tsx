'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/data/products';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const total = getCartTotal();
  const shipping = total >= FREE_SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_COST;
  const grandTotal = total + shipping;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-anthracite/40 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-ivory shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone/20">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-terracotta" />
            <h2 className="font-serif text-xl font-semibold">Mon Panier</h2>
            {items.length > 0 && (
              <span className="text-sm text-stone">({items.reduce((s, i) => s + i.quantity, 0)} article{items.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''})</span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-stone/10 transition-colors"
            aria-label="Fermer le panier"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <ShoppingBag size={64} className="text-stone/30" />
            <p className="text-stone text-center">Votre panier est vide.<br />Découvrez nos collections !</p>
            <button
              onClick={closeDrawer}
              className="mt-2 px-6 py-3 bg-terracotta text-white text-sm font-medium rounded-none hover:bg-terracotta/90 transition-colors tracking-wider uppercase"
            >
              Continuer mes achats
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map(item => (
                <div key={item.cartItemId} className="flex gap-4 py-4 border-b border-stone/10 last:border-0">
                  <div className="relative w-20 h-24 flex-shrink-0 bg-stone/10">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-anthracite truncate">{item.product.name}</p>
                    <p className="text-xs text-stone mt-0.5">
                      {item.selectedSize} · {item.selectedColor}
                    </p>
                    <p className="text-sm font-semibold text-anthracite mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-stone/30 hover:border-anthracite transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-stone/30 hover:border-anthracite transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={12} />
                      </button>
                      <span className="ml-auto text-sm font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="self-start p-1.5 text-stone hover:text-red-500 transition-colors"
                    aria-label="Supprimer l'article"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-stone/20 px-6 py-6 space-y-3 bg-white">
              {shipping === 0 ? (
                <div className="flex justify-between text-xs text-green-600 font-medium">
                  <span>🎉 Livraison offerte !</span>
                  <span>Gratuite</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm text-stone">
                    <span>Sous-total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone">
                    <span>Livraison</span>
                    <span>{formatPrice(SHIPPING_COST)}</span>
                  </div>
                  <p className="text-xs text-stone">
                    Plus que {formatPrice(FREE_SHIPPING_THRESHOLD - total)} pour la livraison gratuite
                  </p>
                </>
              )}
              <div className="flex justify-between text-base font-semibold text-anthracite pt-2 border-t border-stone/10">
                <span>Total</span>
                <span className="font-bold text-lg">{formatPrice(grandTotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="block w-full bg-anthracite text-ivory text-center py-4 text-sm font-medium tracking-widest uppercase hover:bg-terracotta transition-colors duration-200 mt-4"
              >
                Passer la commande
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
