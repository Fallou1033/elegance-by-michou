'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Copy, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export type PaymentMethod = 'cash' | 'wave' | 'orange-money';

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  total?: number;
}

const PAYMENT_METHODS = [
  {
    id: 'cash' as PaymentMethod,
    label: 'Paiement à la livraison',
    description: 'Payez en espèces à la réception de votre colis',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 3H8L2 7h20l-6-4z"/>
        <circle cx="12" cy="14" r="2"/>
      </svg>
    ),
  },
  {
    id: 'wave' as PaymentMethod,
    label: 'Wave',
    description: 'Transfert direct vers le compte Wave de la boutique',
    icon: (
      <Image
        src="/images/payment-methods/wave-logo.png"
        alt="Wave"
        width={48}
        height={27}
        className="h-7 w-auto object-contain rounded"
      />
    ),
  },
  {
    id: 'orange-money' as PaymentMethod,
    label: 'Orange Money',
    description: 'Transfert direct vers le numéro Orange Money de la boutique',
    icon: (
      <div className="h-7 w-10 bg-white rounded border border-stone/20 flex items-center justify-center p-1 shadow-2xs">
        <Image
          src="/images/payment-methods/orange-money-arrows.png"
          alt="Orange Money"
          width={32}
          height={20}
          className="h-5 w-auto object-contain"
        />
      </div>
    ),
  },
];

export default function PaymentSelector({ value, onChange, total }: PaymentSelectorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {PAYMENT_METHODS.map(method => {
        const isSelected = value === method.id;

        return (
          <div
            key={method.id}
            onClick={() => onChange(method.id)}
            className={`border-2 transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'border-terracotta bg-terracotta/5'
                : 'border-stone/20 hover:border-stone/50 bg-white'
            }`}
          >
            <button
              type="button"
              id={`payment-method-${method.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(method.id);
              }}
              className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
            >
              <div className="w-12 h-7 flex items-center justify-center flex-shrink-0">{method.icon}</div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${ isSelected ? 'text-terracotta' : 'text-anthracite' }`}>
                  {method.label}
                </p>
                <p className="text-xs text-stone mt-0.5">{method.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'border-terracotta' : 'border-stone/30'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-terracotta" />}
              </div>
            </button>

            {/* Instruction banner for Wave */}
            {isSelected && method.id === 'wave' && (
              <div className="mx-4 mb-4 p-3 bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-sky-900">Numéro Wave boutique :</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, '782644102')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-sky-300 font-semibold text-sky-800 hover:bg-sky-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    <span>{copied ? 'Copié !' : 'Copier : 78 264 41 02'}</span>
                  </button>
                </div>
                <p className="text-sky-800 leading-relaxed">
                  Envoyez {total ? <strong>{formatPrice(total)}</strong> : 'le montant total'} vers le numéro <strong>+221 78 264 41 02</strong> (Boutique Elegance By Michou).
                  Dès confirmation de la commande, vous pourrez ouvrir l'application Wave directement et envoyer votre reçu sur WhatsApp.
                </p>
              </div>
            )}

            {/* Instruction banner for Orange Money */}
            {isSelected && method.id === 'orange-money' && (
              <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-amber-900">Numéro Orange Money boutique :</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, '782644102')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    <span>{copied ? 'Copié !' : 'Copier : 78 264 41 02'}</span>
                  </button>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  Envoyez {total ? <strong>{formatPrice(total)}</strong> : 'le montant total'} vers le numéro <strong>+221 78 264 41 02</strong> (via Max it ou <strong>#144#</strong>).
                  Dès confirmation de la commande, vous pourrez transmettre votre capture de reçu directement sur WhatsApp.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
