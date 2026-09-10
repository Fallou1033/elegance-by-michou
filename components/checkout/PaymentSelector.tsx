'use client';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export type PaymentMethod = 'wave' | 'orange-money';

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  total?: number;
}

const PAYMENT_METHODS = [
  {
    id: 'wave' as PaymentMethod,
    label: 'Wave',
    description: 'Paiement direct Wave (App Wave ou QR Code en 1 clic)',
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
    description: 'Paiement direct Orange Money (App Max it ou Code OTP #144#)',
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
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-2.5 bg-stone/5 border border-stone/20 text-xs text-stone rounded">
        <span className="text-sm">🔒</span>
        <span>
          Paiement direct et sécurisé via <strong>Wave Sénégal</strong> et <strong>Orange Money Sénégal</strong>. Vous validerez directement sur votre mobile.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PAYMENT_METHODS.map(method => {
          const isSelected = value === method.id;

          return (
            <div
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`border-2 transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'border-terracotta bg-terracotta/5 shadow-xs'
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

              {isSelected && method.id === 'wave' && (
                <div className="mx-4 mb-4 p-3 bg-sky-50/80 border border-sky-200 text-xs text-sky-900 flex items-center gap-2.5 rounded">
                  <span className="text-base flex-shrink-0">⚡</span>
                  <p className="leading-relaxed">
                    En cliquant sur le bouton ci-dessous, vous serez redirigé directement vers l'application <strong>Wave</strong> pour valider le paiement sécurisé de {total ? <strong>{formatPrice(total)}</strong> : 'votre commande'}.
                  </p>
                </div>
              )}

              {isSelected && method.id === 'orange-money' && (
                <div className="mx-4 mb-4 p-3 bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-center gap-2.5 rounded">
                  <span className="text-base flex-shrink-0">⚡</span>
                  <p className="leading-relaxed">
                    En cliquant sur le bouton ci-dessous, vous serez redirigé vers le guichet officiel sécurisé <strong>Orange Money</strong> pour valider votre paiement via OTP ou #144#.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
