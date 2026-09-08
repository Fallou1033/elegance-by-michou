'use client';
import { Star, CheckCircle2, Quote, HeartHandshake } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  initials: string;
  rating: number;
  product: string;
  comment: string;
  date: string;
  avatarBg: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rokhaya',
    location: 'Dakar, Sacré-Cœur',
    initials: 'RO',
    rating: 5,
    product: 'Mini robe brodé anglais 100% coton',
    comment:
      'J’ai commandé la mini robe en broderie anglaise pour un mariage civil. La qualité du tissu en pur coton est exceptionnelle et la coupe est juste sublime. Livraison reçue à Dakar en moins de 24h avec un paquet très soigné. Je recommande les yeux fermés !',
    date: 'Il y a 3 jours',
    avatarBg: 'bg-gradient-to-br from-terracotta to-amber-700 text-white',
  },
  {
    name: 'Ass Malick',
    location: 'Almadies, Dakar',
    initials: 'AM',
    rating: 5,
    product: 'Ensemble lin homme',
    comment:
      'Totalement conquis par l’ensemble en lin. Le tissu est léger, fluide et ultra-respirant même sous la chaleur dakaroise. Le paiement direct via Wave s’est fait en 2 secondes et les échanges avec la boutique sur WhatsApp étaient très professionnels.',
    date: 'Il y a 1 semaine',
    avatarBg: 'bg-gradient-to-br from-anthracite to-stone text-white',
  },
  {
    name: 'Ousmane Noel Dieng',
    location: 'Thiès / Mermoz',
    initials: 'ON',
    rating: 5,
    product: 'Costume africain de prestige',
    comment:
      'Le costume africain avec le col Mao a fait sensation lors de ma cérémonie officielle. Les broderies sont d’une grande précision, la tenue du tissu est noble et la coupe est impeccable. Elegance By Michou incarne le vrai raffinement africain.',
    date: 'Il y a 2 semaines',
    avatarBg: 'bg-gradient-to-br from-amber-800 to-terracotta text-white',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="temoignages" className="bg-gradient-to-b from-ivory via-stone/5 to-ivory py-16 md:py-24 border-t border-stone/15 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            <HeartHandshake size={14} />
            <span>Témoignages &amp; Avis Clients</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-anthracite tracking-tight mb-4">
            La Confiance de nos Clients
          </h2>
          <p className="text-stone text-sm sm:text-base leading-relaxed">
            Découvrez les retours authentiques de celles et ceux qui ont choisi nos pièces au Sénégal pour leurs moments du quotidien et leurs grandes occasions.
          </p>

          {/* Note globale */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-2">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={17} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-anthracite">4.9 / 5</span>
            <span className="text-xs text-stone">· Avis vérifiés</span>
          </div>
        </div>

        {/* Grille des 3 témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="relative bg-white border border-stone/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg hover:border-terracotta/40 transition-all duration-300 group"
            >
              {/* Icône guillemet décorative */}
              <div className="absolute top-6 right-6 text-stone/15 group-hover:text-terracotta/20 transition-colors pointer-events-none">
                <Quote size={40} className="stroke-1" />
              </div>

              <div>
                {/* Étoiles & Produit acheté */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs font-medium text-terracotta mb-3 line-clamp-1">
                  Article : {t.product}
                </p>

                {/* Commentaire */}
                <p className="text-anthracite/90 text-sm leading-relaxed mb-6 italic">
                  « {t.comment} »
                </p>
              </div>

              {/* Auteur */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-stone/10 mt-auto">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-serif text-sm font-bold shadow-xs flex-shrink-0 ${t.avatarBg}`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-anthracite truncate">{t.name}</h4>
                    <span
                      className="inline-flex items-center gap-0.5 text-[11px] text-green-700 bg-green-50 px-1.5 py-0.2 rounded-full font-medium"
                      title="Acheteur vérifié"
                    >
                      <CheckCircle2 size={11} className="text-green-600" />
                      Vérifié
                    </span>
                  </div>
                  <p className="text-xs text-stone truncate">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bandeau d'engagement / réassurance */}
        <div className="mt-14 pt-10 border-t border-stone/20 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">🚚</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-anthracite">Livraison Express</h4>
            <p className="text-[11px] text-stone mt-0.5">Dakar en 24h &amp; toutes les régions</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">🔒</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-anthracite">Paiement 100% Sécurisé</h4>
            <p className="text-[11px] text-stone mt-0.5">Wave &amp; Orange Money en 1 clic</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">🧵</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-anthracite">Finitions Soignées</h4>
            <p className="text-[11px] text-stone mt-0.5">Tissus nobles &amp; coupes élégantes</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">💬</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-anthracite">Service Client Dédié</h4>
            <p className="text-[11px] text-stone mt-0.5">Assistance directe sur WhatsApp</p>
          </div>
        </div>
      </div>
    </section>
  );
}
