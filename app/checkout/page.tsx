'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { generateOrderNumber } from '@/lib/utils';
import PaymentSelector from '@/components/checkout/PaymentSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { SENEGAL_CITIES } from '@/data/products';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/data/products';

type PaymentMethod = 'wave' | 'orange-money';

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export default function CheckoutPage() {
  const { items, isLoaded, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const subtotal = getCartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    return /^(\+221|221)?[76][0-9]{8}$/.test(cleaned);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Veuillez saisir votre nom complet.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Format invalide. Exemple : +221 77 000 00 00';
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = 'Veuillez saisir votre adresse complète.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Veuillez sélectionner votre ville.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      customerName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      notes: formData.notes,
      paymentMethod,
      items,
      subtotal,
      shipping,
      total,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    clearCart();
    router.push('/confirmation');
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-stone text-xl">Chargement de votre panier...</p>
      </div>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-stone text-xl mb-6">Votre panier est vide.</p>
        <Link href="/" className="inline-block bg-anthracite text-ivory px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-terracotta transition-colors">
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border text-sm outline-none transition-colors focus:border-anthracite ${
      hasError ? 'border-red-400 bg-red-50/30' : 'border-stone/30 bg-white hover:border-stone'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      {/* Header */}
      <nav className="mb-8">
        <Link href="/" className="flex items-center gap-1 text-stone text-sm hover:text-terracotta transition-colors">
          <ChevronLeft size={16} /> Retour à la boutique
        </Link>
      </nav>
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-anthracite mb-8">Finaliser ma commande</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery info */}
            <section>
              <h2 className="font-serif text-xl font-semibold mb-6 pb-2 border-b border-stone/10">Informations de livraison</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                    Nom complet <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id="fullName" name="fullName" type="text" value={formData.fullName}
                    onChange={handleChange} placeholder="Prénom et Nom"
                    className={inputClass(!!errors.fullName)}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle size={12} />{errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                    Téléphone <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id="phone" name="phone" type="tel" value={formData.phone}
                    onChange={handleChange} placeholder="+221 77 000 00 00"
                    className={inputClass(!!errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle size={12} />{errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                    Adresse de livraison <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id="address" name="address" type="text" value={formData.address}
                    onChange={handleChange} placeholder="N° rue, quartier..."
                    className={inputClass(!!errors.address)}
                    aria-describedby={errors.address ? 'address-error' : undefined}
                  />
                  {errors.address && (
                    <p id="address-error" className="flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle size={12} />{errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                    Ville / Quartier <span className="text-terracotta">*</span>
                  </label>
                  <select
                    id="city" name="city" value={formData.city}
                    onChange={handleChange}
                    className={`${inputClass(!!errors.city)} appearance-none cursor-pointer`}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                  >
                    <option value="">Sélectionnez votre ville...</option>
                    {SENEGAL_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <p id="city-error" className="flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle size={12} />{errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                    Instructions de livraison <span className="text-stone font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    id="notes" name="notes" value={formData.notes}
                    onChange={handleChange}
                    placeholder="Point de repère, instructions particulières..."
                    rows={3}
                    className="w-full px-4 py-3 border border-stone/30 text-sm outline-none transition-colors focus:border-anthracite hover:border-stone bg-white resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-serif text-xl font-semibold mb-6 pb-2 border-b border-stone/10">Mode de paiement</h2>
              <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} total={total} />
            </section>

            {/* Mobile order summary */}
            <div className="lg:hidden">
              <OrderSummary items={items} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-200 ${
                isSubmitting
                  ? 'bg-stone/50 text-stone cursor-not-allowed'
                  : 'bg-anthracite text-ivory hover:bg-terracotta'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Traitement de votre commande...
                </>
              ) : (
                `Valider ma commande — ${new Intl.NumberFormat('fr-FR').format(total)} FCFA`
              )}
            </button>
          </div>

          {/* Sidebar summary - desktop */}
          <div className="hidden lg:block">
            <OrderSummary items={items} sticky />
          </div>
        </div>
      </form>
    </div>
  );
}
