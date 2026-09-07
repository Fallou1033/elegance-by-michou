import Image from 'next/image';
import type { CartItem } from '@/types';
import {
  formatPrice,
  calculateCartTotal,
  calculateCartSavings,
  getItemUnitPrice,
  getProductTotalQtyInCart,
} from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/data/products';

interface OrderSummaryProps {
  items: CartItem[];
  sticky?: boolean;
}

export default function OrderSummary({ items, sticky = false }: OrderSummaryProps) {
  const subtotal = calculateCartTotal(items);
  const savings = calculateCartSavings(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  return (
    <div className={`bg-white border border-stone/20 ${sticky ? 'sticky top-24' : ''}`}>
      <div className="px-6 py-5 border-b border-stone/10">
        <h3 className="font-serif text-lg font-semibold">Récapitulatif de commande</h3>
      </div>

      <div className="px-6 py-4 space-y-4 max-h-80 overflow-y-auto">
        {items.map(item => {
          const totalModelQty = getProductTotalQtyInCart(items, item.product.id);
          const unitPrice = getItemUnitPrice(item.product, totalModelQty);
          const isDiscounted = unitPrice < item.product.price;
          const lineTotal = unitPrice * item.quantity;

          return (
            <div key={item.cartItemId} className="flex gap-3">
              <div className="relative w-14 h-16 flex-shrink-0 bg-stone/10">
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone text-white text-xs rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-anthracite truncate">{item.product.name}</p>
                <p className="text-xs text-stone">{item.selectedSize} · {item.selectedColor}</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <p className={`text-sm font-semibold ${isDiscounted ? 'text-terracotta' : ''}`}>{formatPrice(lineTotal)}</p>
                  {isDiscounted && (
                    <span className="text-[10px] bg-terracotta/10 text-terracotta px-1.5 py-0.5 font-medium rounded">
                      11 000 FCFA/u
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-stone/10 space-y-2">
        {savings > 0 && (
          <div className="flex justify-between text-xs text-green-700 font-semibold bg-green-50 p-2 border border-green-200 rounded-xs">
            <span>✨ Remise volume (&gt;5 robes)</span>
            <span>-{formatPrice(savings)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-stone">
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-stone">
          <span>Livraison</span>
          <span>{shipping === 0 ? <span className="text-green-600">Gratuite</span> : formatPrice(SHIPPING_COST)}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-stone/70">Gratuite à partir de {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
        )}
        <div className="flex justify-between text-base font-bold text-anthracite pt-3 border-t border-stone/10">
          <span>Total</span>
          <span className="text-lg">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
