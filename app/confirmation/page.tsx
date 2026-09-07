'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, MessageCircle, Copy, Check, Smartphone, PhoneCall } from 'lucide-react';
import { formatPrice, encodeWhatsAppMessage } from '@/lib/utils';
import { WHATSAPP_NUMBER } from '@/data/products';
import type { OrderData } from '@/types';

export default function ConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [waveAppUrl, setWaveAppUrl] = useState(
    'intent:#Intent;package=com.wave.personal;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.wave.personal;end'
  );
  const [maxItUrl, setMaxItUrl] = useState(
    'intent:#Intent;package=com.orange.myorange.sn;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.orange.myorange.sn;end'
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/iPad|iPhone|iPod/.test(ua)) {
        setWaveAppUrl('wave://');
        setMaxItUrl('https://apps.apple.com/fr/app/orange-max-it-s%C3%A9n%C3%A9gal/id1527771746');
      } else if (!/android/i.test(ua)) {
        setWaveAppUrl('https://play.google.com/store/apps/details?id=com.wave.personal');
        setMaxItUrl('https://maxit.orange.sn/');
      }
    }
  }, []);

  const handleOpenWave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) {
      e.preventDefault();
      window.location.href = 'wave://';
      setTimeout(() => {
        window.location.href = 'https://apps.apple.com/app/wave-mobile-money/id1487840131';
      }, 1200);
    }
  };

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
    wave: 'Wave',
    'orange-money': 'Orange Money',
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

      {/* WAVE PAYMENT INSTRUCTIONS */}
      {order.paymentMethod === 'wave' && (
        <div id="wave-payment-instructions" className={`mb-8 p-6 bg-sky-50/80 border-2 border-sky-300 transition-all duration-700 delay-200 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-sky-200">
            <div className="w-10 h-10 rounded-full bg-white border border-sky-200 flex items-center justify-center p-1.5 shadow-2xs">
              <Image src="/images/payment-methods/wave-logo.png" alt="Wave" width={36} height={20} className="object-contain" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-sky-950">Instructions de paiement Wave</h2>
              <p className="text-xs text-sky-800">Réglez votre commande directement sur le compte Wave de la boutique</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-white p-3.5 border border-sky-200">
              <span className="text-xs text-stone uppercase tracking-wider block font-medium">Montant exact à payer</span>
              <span className="text-2xl font-bold text-sky-950">{formatPrice(order.total)}</span>
            </div>

            <div className="bg-white p-3.5 border border-sky-200 flex flex-col justify-between">
              <span className="text-xs text-stone uppercase tracking-wider block font-medium">Numéro Wave boutique</span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-lg font-bold text-anthracite">+221 78 264 41 02</span>
                <button
                  type="button"
                  onClick={() => handleCopy('782644102')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-900 border border-sky-300 hover:bg-sky-200 transition-colors shadow-2xs cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={waveAppUrl}
              onClick={handleOpenWave}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#1DC3F4] text-white text-sm font-semibold tracking-wider uppercase hover:bg-[#0bb2e3] transition-colors shadow-xs"
            >
              <Smartphone size={18} />
              Ouvrir l'application Wave
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#25D366] text-white text-sm font-semibold tracking-wider uppercase hover:bg-[#1da851] transition-colors shadow-xs"
            >
              <MessageCircle size={18} />
              Envoyer mon reçu sur WhatsApp
            </a>
          </div>

          <p className="text-xs text-sky-900/80 text-center mt-3 leading-relaxed">
            💡 Indiquez votre numéro de commande <strong>{order.orderNumber}</strong> en motif de transfert, puis transmettez votre reçu par WhatsApp.
          </p>
        </div>
      )}

      {/* ORANGE MONEY PAYMENT INSTRUCTIONS */}
      {order.paymentMethod === 'orange-money' && (
        <div id="om-payment-instructions" className={`mb-8 p-6 bg-amber-50/80 border-2 border-amber-300 transition-all duration-700 delay-200 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-200">
            <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center p-1.5 shadow-2xs">
              <Image src="/images/payment-methods/orange-money-arrows.png" alt="Orange Money" width={28} height={18} className="object-contain" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-950">Instructions Orange Money</h2>
              <p className="text-xs text-amber-900">Réglez votre commande directement sur le numéro Orange Money de la boutique</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-white p-3.5 border border-amber-200">
              <span className="text-xs text-stone uppercase tracking-wider block font-medium">Montant exact à payer</span>
              <span className="text-2xl font-bold text-amber-950">{formatPrice(order.total)}</span>
            </div>

            <div className="bg-white p-3.5 border border-amber-200 flex flex-col justify-between">
              <span className="text-xs text-stone uppercase tracking-wider block font-medium">Numéro OM boutique</span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-lg font-bold text-anthracite">+221 78 264 41 02</span>
                <button
                  type="button"
                  onClick={() => handleCopy('782644102')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors shadow-2xs cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="tel:#144#"
                className="flex items-center justify-center gap-2 py-3.5 bg-[#FF7900] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase hover:bg-[#e06b00] transition-colors shadow-xs"
              >
                <PhoneCall size={16} />
                Composer #144#
              </a>

              <a
                href={maxItUrl}
                className="flex items-center justify-center gap-2 py-3.5 bg-white text-amber-950 border border-amber-400 text-xs sm:text-sm font-semibold tracking-wider uppercase hover:bg-amber-100 transition-colors shadow-xs"
              >
                <Smartphone size={16} />
                Ouvrir Max it
              </a>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#25D366] text-white text-sm font-semibold tracking-wider uppercase hover:bg-[#1da851] transition-colors shadow-xs"
            >
              <MessageCircle size={18} />
              Envoyer mon reçu sur WhatsApp
            </a>
          </div>

          <p className="text-xs text-amber-900/80 text-center mt-3 leading-relaxed">
            💡 Indiquez votre numéro de commande <strong>{order.orderNumber}</strong> en référence de transfert, puis transmettez votre reçu par WhatsApp.
          </p>
        </div>
      )}

      {/* STANDARD WHATSAPP CTA FOR CASH OR CARD */}
      {order.paymentMethod !== 'wave' && order.paymentMethod !== 'orange-money' && (
        <div className={`mb-8 transition-all duration-700 delay-200 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white text-sm font-medium tracking-wider uppercase hover:bg-[#1da851] transition-colors duration-200 shadow-xs"
          >
            <MessageCircle size={20} />
            Confirmer via WhatsApp
          </a>
          <p className="text-xs text-stone text-center mt-2">Un message pré-rempli sera généré pour confirmer votre commande avec notre équipe.</p>
        </div>
      )}

      {/* Order recap */}
      <div className={`bg-white border border-stone/20 transition-all duration-700 delay-300 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="px-6 py-5 border-b border-stone/10">
          <h2 className="font-serif text-lg font-semibold">Détail de votre commande</h2>
        </div>

        {/* Items */}
        <div className="px-6 py-4 space-y-4">
          {order.items.map(item => (
            <div key={item.cartItemId} className="flex gap-3">
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
            <span>Total payé</span><span className="text-lg text-anthracite">{formatPrice(order.total)}</span>
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
