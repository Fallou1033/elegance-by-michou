'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { formatPrice, encodeWhatsAppMessage } from '@/lib/utils';
import { WHATSAPP_NUMBER } from '@/data/products';
import type { OrderData } from '@/types';

function ConfirmationContent() {
  const isWaveSuccess = searchParams.get('wave') === 'success';
  const isOmSuccess = searchParams.get('om') === 'success';
  const isOnlineSuccess = isWaveSuccess || isOmSuccess || searchParams.get('status') === 'success';
  const [order, setOrder] = useState<OrderData | null>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('lastOrder');
    if (raw) {
      const parsed = JSON.parse(raw) as OrderData;
      setOrder(parsed);
      setTimeout(() => setShowContent(true), 200);
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-stone">Aucune commande trouvée.</p>
        <Link href="/" className="mt-6 inline-block text-terracotta hover:underline">Retourner à la boutique</Link>
      </div>
    );
  }

  const PAYMENT_LABELS: Record<string, string> = {
    wave: 'Wave (Paiement direct)',
    'orange-money': 'Orange Money (Paiement direct)',
  };

  const whatsappMessage = encodeWhatsAppMessage({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    items: order.items.map(i => ({
      name: i.product.name,
      size: i.selectedSize,
      color: i.selectedColor,
      quantity: i.quantity,
      price: i.product.price,
    })),
    total: order.total,
    address: order.address,
    city: order.city,
    paymentMethod: PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod,
  });

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
  const firstName = order.customerName.split(' ')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Success animation */}
      <div className={`text-center mb-8 transition-all duration-700 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-50 mb-4 md:mb-6">
          <CheckCircle size={44} className="text-green-500" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-anthracite mb-2">
          Merci, {firstName} !
        </h1>
        <p className="text-stone text-base">
          Votre commande a été enregistrée avec succès.
        </p>
        <p className="mt-2 text-sm font-medium text-anthracite">
          N° de commande : <span className="text-terracotta font-bold tracking-wider">{order.orderNumber}</span>
        </p>
      </div>

      {/* DIRECT PAYMENT STATUS / BADGE */}
      <div className={`mb-8 p-6 bg-emerald-50 border-2 border-emerald-400 transition-all duration-700 delay-200 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-emerald-200">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-emerald-950">
              {isOnlineSuccess
                ? `Paiement direct validé via ${order.paymentMethod === 'orange-money' ? 'Orange Money' : 'Wave'}`
                : `Commande confirmée — Règlement par ${order.paymentMethod === 'orange-money' ? 'Orange Money' : 'Wave'}`}
            </h2>
            <p className="text-xs text-emerald-800">
              Règlement par <strong>{order.paymentMethod === 'orange-money' ? 'Orange Money (Direct)' : 'Wave (Direct)'}</strong> — Montant : <strong>{formatPrice(order.total)}</strong>
            </p>
          </div>
        </div>
        <p className="text-xs text-emerald-900 leading-relaxed bg-white/80 p-3 rounded border border-emerald-200">
          Votre commande a été enregistrée et transmise à notre équipe pour préparation immédiate.
        </p>
      </div>

      {/* WHATSAPP ACTION BUTTON */}
      <div className={`mb-8 transition-all duration-700 delay-300 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white text-sm font-semibold tracking-wider uppercase hover:bg-[#1da851] transition-colors shadow-md rounded-xs"
        >
          <MessageCircle size={20} />
          <span>Notifier la boutique sur WhatsApp</span>
        </a>
        <p className="text-xs text-stone text-center mt-2">
          Cliquez pour transmettre automatiquement le récapitulatif de votre commande à Michou.
        </p>
      </div>

      {/* Order summary card */}
      <div className={`bg-white border border-stone/20 overflow-hidden transition-all duration-700 delay-400 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="px-6 py-4 bg-stone/5 border-b border-stone/10 flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold">Détails de la commande</h2>
          <span className="text-xs text-stone">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>

        {/* Items list */}
        <div className="px-6 divide-y divide-stone/10">
          {order.items.map(item => (
            <div key={item.cartItemId} className="py-4 flex items-center gap-4">
              <div className="relative w-14 h-16 flex-shrink-0 bg-stone/10">
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-stone">{item.selectedSize} · {item.selectedColor} · x{item.quantity}</p>
                <p className="text-sm font-semibold mt-1">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-stone/10 space-y-2">
          <div className="flex justify-between text-sm text-stone">
            <span>Sous-total</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone">
            <span>Livraison</span>
            <span>{order.shipping === 0 ? <span className="text-green-600">Gratuite</span> : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-stone/10">
            <span>Total</span><span className="text-lg text-anthracite">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Delivery info */}
        <div className="px-6 py-4 border-t border-stone/10 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone mb-2">Informations de livraison</p>
          <p className="text-sm"><strong>Client :</strong> {order.customerName}</p>
          <p className="text-sm"><strong>Téléphone :</strong> {order.phone}</p>
          <p className="text-sm"><strong>Adresse :</strong> {order.address}, {order.city}</p>
          <p className="text-sm"><strong>Paiement :</strong> {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
          {order.notes && <p className="text-sm"><strong>Notes :</strong> {order.notes}</p>}
        </div>
      </div>

      {/* Back to shop */}
      <div className={`text-center mt-8 transition-all duration-700 delay-500 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <Link
          href="/"
          className="inline-block px-8 py-3 border border-anthracite text-anthracite text-sm font-medium tracking-widest uppercase hover:bg-anthracite hover:text-ivory transition-colors duration-200"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="text-stone text-xl">Chargement de votre confirmation...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
