export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
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
    .map(item => `• ${item.name} (${item.size}, ${item.color}) x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    .join('\n');
  
  let paymentDetails = `💳 Paiement : ${order.paymentMethod}`;
  if (order.paymentMethod.toLowerCase().includes('wave')) {
    paymentDetails = `💳 Paiement : Wave (Transfert vers +221 78 264 41 02)\n📸 Je vous joins la capture de mon reçu Wave ci-dessous.`;
  } else if (order.paymentMethod.toLowerCase().includes('orange')) {
    paymentDetails = `💳 Paiement : Orange Money (Transfert vers +221 78 264 41 02)\n📸 Je vous joins la capture de mon reçu Orange Money ci-dessous.`;
  }

  const message = `Bonjour Elegance By Michou ! 🛍️\n\nJe confirme ma commande :\n\n📦 Commande N° ${order.orderNumber}\n\n${itemsList}\n\n💰 Total : ${formatPrice(order.total)}\n\n👤 Client : ${order.customerName}\n📍 Adresse : ${order.address}, ${order.city}\n${paymentDetails}\n\nMerci !`;
  
  return encodeURIComponent(message);
}
