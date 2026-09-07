export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

/**
 * Règles de remise sur volume / tarif de gros par produit.
 * Pour la mini-robe brodée anglaise : strictement plus de 5 articles (dès 6 articles),
 * le prix unitaire passe de 13 000 FCFA à 11 000 FCFA.
 */
export const BULK_DISCOUNT_RULES: Record<
  string,
  {
    minQty: number; // 6 (strictement > 5)
    discountedPrice: number; // 11 000 FCFA
    normalPrice: number; // 13 000 FCFA
    label: string;
  }
> = {
  'mini-robe-brode-anglais-100-coton': {
    minQty: 6,
    discountedPrice: 11000,
    normalPrice: 13000,
    label: 'Tarif volume : 11 000 FCFA / robe dès 6 achetées',
  },
};

/**
 * Calcule le prix unitaire d'un article en tenant compte du total acheté pour ce modèle dans le panier.
 */
export function getItemUnitPrice(
  product: { id: string; price: number },
  totalProductQty: number
): number {
  const rule = BULK_DISCOUNT_RULES[product.id];
  if (rule && totalProductQty >= rule.minQty) {
    return rule.discountedPrice;
  }
  return product.price;
}

/**
 * Calcule la quantité totale cumulée d'un même produit dans le panier (toutes tailles/couleurs confondues).
 */
export function getProductTotalQtyInCart(
  items: Array<{ product: { id: string }; quantity: number }>,
  productId: string
): number {
  return items
    .filter(item => item.product.id === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calcule le sous-total du panier avec application dynamique des remises de volume.
 */
export function calculateCartTotal(
  items: Array<{ product: { id: string; price: number }; quantity: number }>
): number {
  const qtyByProduct: Record<string, number> = {};
  for (const item of items) {
    qtyByProduct[item.product.id] = (qtyByProduct[item.product.id] || 0) + item.quantity;
  }

  return items.reduce((sum, item) => {
    const totalQty = qtyByProduct[item.product.id] || item.quantity;
    const unitPrice = getItemUnitPrice(item.product, totalQty);
    return sum + unitPrice * item.quantity;
  }, 0);
}

/**
 * Calcule l'économie totale réalisée grâce aux remises de volume.
 */
export function calculateCartSavings(
  items: Array<{ product: { id: string; price: number }; quantity: number }>
): number {
  const normalTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountedTotal = calculateCartTotal(items);
  return Math.max(0, normalTotal - discountedTotal);
}


export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `CMD-${year}-${num}`;
}

export function encodeWhatsAppMessage(order: {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; size: string; color: string; quantity: number; price: number }>;
  total: number;
  address: string;
  city: string;
  paymentMethod: string;
}): string {
  const itemsList = order.items
    .map(item => {
      const isDiscounted = item.name.toLowerCase().includes('mini robe') && item.price === 11000;
      const note = isDiscounted ? ' [Offre volume : 11 000 FCFA/u]' : '';
      return `• ${item.name} (${item.size}, ${item.color}) x${item.quantity} — ${formatPrice(item.price * item.quantity)}${note}`;
    })
    .join('\n');
  
  let paymentDetails = `💳 Paiement : ${order.paymentMethod}`;
  if (order.paymentMethod.toLowerCase().includes('wave')) {
    paymentDetails = `💳 Paiement : Wave (Sécurisé via PayTech)`;
  } else if (order.paymentMethod.toLowerCase().includes('orange')) {
    paymentDetails = `💳 Paiement : Orange Money (Sécurisé via PayTech)`;
  }

  const message = `Bonjour Elegance By Michou ! 🛍️\n\nJe confirme ma commande :\n\n📦 Commande N° ${order.orderNumber}\n\n${itemsList}\n\n💰 Total : ${formatPrice(order.total)}\n\n👤 Client : ${order.customerName}\n📍 Adresse : ${order.address}, ${order.city}\n${paymentDetails}\n\nMerci !`;
  
  return encodeURIComponent(message);
}
