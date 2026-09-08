import Link from 'next/link';
import { MapPin, Instagram } from 'lucide-react';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_NUMBER } from '@/data/products';

export default function Footer() {
  return (
    <footer className="bg-anthracite text-ivory mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-xl font-semibold mb-4">Elegance By Michou</h3>
            <p className="text-stone text-sm leading-relaxed">
              Votre boutique de mode au Sénégal. Des collections tendance pour femmes et hommes, livrées partout au Sénégal.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-stone">
              <MapPin size={15} className="text-terracotta flex-shrink-0" /> 
              <Link href="/a-propos#google-map" className="hover:text-terracotta transition-colors">
                Liberté 6, en face Camp Pénal — Dakar
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-5">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:text-[#25D366] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>+221 78 871 00 69</span>
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:text-[#E1306C] transition-colors"
                aria-label="Instagram Elegance By Michou"
              >
                <Instagram size={18} className="text-[#E1306C]" />
                <span>{INSTAGRAM_HANDLE}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-stone mb-4">Collections</h4>
            <ul className="space-y-3">
              {[
                { label: 'Femme', href: '/?gender=femme' },
                { label: 'Homme', href: '/?gender=homme' },
                { label: 'Nouveautés', href: '/?badge=Nouveau' },
                { label: 'Promotions', href: '/?badge=Promo' },
                { label: 'Mes Favoris', href: '/favoris' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-ivory/70 hover:text-terracotta transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-stone mb-4">Informations</h4>
            <ul className="space-y-3">
              {[
                { label: 'À propos de nous', href: '/a-propos' },
                { label: 'Contact & WhatsApp', href: '/a-propos#contact' },
                { label: 'Instagram @elegance_by_michou', href: INSTAGRAM_URL, external: true },
                { label: 'Livraison & Retours', href: '/a-propos#contact' },
                { label: 'Paiement sécurisé', href: '/checkout' },
              ].map(item => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ivory/70 hover:text-[#E1306C] transition-colors flex items-center gap-1.5"
                    >
                      <Instagram size={13} className="text-[#E1306C]" />
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link href={item.href} className="text-sm text-ivory/70 hover:text-terracotta transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone">
          <p>© 2026 Elegance By Michou. Tous droits réservés.</p>
          <p>Fait avec ❤️ au Sénégal</p>
        </div>
      </div>
    </footer>
  );
}
