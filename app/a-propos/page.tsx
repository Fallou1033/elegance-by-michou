import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  MapPin,
  Clock,
  ChevronLeft,
  ArrowRight,
  Scissors,
  ExternalLink,
  Navigation,
  Instagram,
} from "lucide-react";
import {
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
} from "@/data/products";

export const metadata: Metadata = {
  title: "À Propos de Nous & Contacts | Elegance By Michou",
  description:
    "Découvrez l’histoire d’Elegance By Michou, notre passion pour la mode sénégalaise haut de gamme et contactez notre créatrice.",
};

export default function AProposPage() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Bonjour Michou ! Je visite votre boutique et j'aimerais avoir plus d'informations sur vos créations.",
  )}`;

  return (
    <div className="bg-ivory min-h-screen">
      {/* Fil d'Ariane / Retour */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/#catalogue"
          className="inline-flex items-center gap-2 text-stone text-sm font-medium hover:text-terracotta transition-colors py-1.5 px-2 -ml-2 rounded-md hover:bg-stone/10 w-fit group"
        >
          <ChevronLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span>Retour à la boutique</span>
        </Link>
      </div>

      {/* Hero Header */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            <Sparkles size={14} />
            <span>Maison de Couture &amp; Prêt-à-porter</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-anthracite leading-tight tracking-tight mb-6">
            L&apos;Histoire d&apos;Elegance By Michou
          </h1>
          <p className="text-stone text-base sm:text-lg md:text-xl leading-relaxed">
            Sublimer chaque silhouette à travers l&apos;alliance harmonieuse du
            raffinement traditionnel sénégalais et des coupes contemporaines les
            plus chics.
          </p>
        </div>
      </section>

      {/* Section Histoire & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-stone/15">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photo d'ambiance / Savoir-faire */}
          <div className="relative aspect-[4/5] w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl bg-stone/10">
            <Image
              src="/images/products/Grand%20boubou/WhatsApp%20Image%202026-09-05%20at%2014.00.52.jpeg"
              alt="Artisanat et création Elegance By Michou"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-6 h-px bg-terracotta" />
                <span className="text-xs uppercase tracking-widest text-terracotta font-bold">
                  Fait au Sénégal
                </span>
              </div>
              <p className="font-serif text-xl sm:text-2xl font-semibold">
                « L&apos;élégance n&apos;est pas de se faire remarquer, mais de
                se faire retenir. »
              </p>
              <p className="text-xs text-ivory/80 mt-1">— Michou, Fondatrice</p>
            </div>
          </div>

          {/* Texte de l'histoire */}
          <div className="space-y-6">
            <div className="inline-block border-b-2 border-terracotta pb-1">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
                La Naissance de la Marque
              </h2>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-anthracite leading-snug">
              Une passion pour le vêtement d&apos;exception et le sens du
              détail.
            </h3>
            <div className="space-y-4 text-stone text-sm sm:text-base leading-relaxed">
              <p>
                Fondée à Dakar par <strong>Michou</strong>, la marque{" "}
                <strong>Elegance By Michou</strong> est née d&apos;une
                conviction profonde : la mode doit célébrer l&apos;identité
                culturelle tout en offrant un confort et une allure moderne au
                quotidien.
              </p>
              <p>
                Chaque pièce de nos collections — de nos délicates{" "}
                <em>mini robes en broderie anglaise</em> à nos{" "}
                <em>ensembles masculins en pur lin</em>, en passant par nos
                prestigieux <em>costumes africains</em> et{" "}
                <em>grands boubous d&apos;apparat</em> — est pensée pour révéler
                votre prestance lors de vos grandes cérémonies comme dans vos
                instants précieux.
              </p>
              <p>
                Nous travaillons en étroite collaboration avec des artisans
                tailleurs d&apos;excellence à Dakar, perpétuant le savoir-faire
                textile sénégalais avec des finitions dignes de la haute
                couture.
              </p>
            </div>

            {/* Badges de confiance */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-stone/15">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-full bg-terracotta/10 text-terracotta">
                  <Scissors size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-anthracite">
                    Coupes Sur-Mesure
                  </h4>
                  <p className="text-[11px] text-stone">Finitions manuelles</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-full bg-terracotta/10 text-terracotta">
                  <Heart size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-anthracite">
                    100% Coton &amp; Lin
                  </h4>
                  <p className="text-[11px] text-stone">Matières naturelles</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-full bg-terracotta/10 text-terracotta">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-anthracite">
                    Qualité Garantie
                  </h4>
                  <p className="text-[11px] text-stone">Retours faciles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Nos Engagements / Piliers */}
      <section className="bg-white py-16 md:py-24 border-y border-stone/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta mb-2">
              Ce qui nous anime
            </h2>
            <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-anthracite">
              Nos 3 Engagements Fondamentaux
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-ivory border border-stone/15 p-8 rounded-2xl shadow-xs hover:border-terracotta/40 hover:shadow-md transition-all duration-300">
              <span className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-serif text-lg font-bold mb-6">
                01
              </span>
              <h4 className="font-serif text-xl font-semibold text-anthracite mb-3">
                Matières Nobles &amp; Authentiques
              </h4>
              <p className="text-stone text-sm leading-relaxed">
                Nous sélectionnons rigoureusement nos tissus : lin naturel
                ultra-respirant, broderie anglaise 100% coton, et bazin de haute
                qualité pour une tenue impeccable dans le temps.
              </p>
            </div>

            <div className="bg-ivory border border-stone/15 p-8 rounded-2xl shadow-xs hover:border-terracotta/40 hover:shadow-md transition-all duration-300">
              <span className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-serif text-lg font-bold mb-6">
                02
              </span>
              <h4 className="font-serif text-xl font-semibold text-anthracite mb-3">
                L&apos;Excellence de l&apos;Artisanat Sénégalais
              </h4>
              <p className="text-stone text-sm leading-relaxed">
                Nos créations sont conçues à la main au Sénégal. Chaque couture,
                chaque bouton et chaque broderie géométrique témoigne de la
                fierté et de la virtuosité de nos maîtres artisans.
              </p>
            </div>

            <div className="bg-ivory border border-stone/15 p-8 rounded-2xl shadow-xs hover:border-terracotta/40 hover:shadow-md transition-all duration-300">
              <span className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-serif text-lg font-bold mb-6">
                03
              </span>
              <h4 className="font-serif text-xl font-semibold text-anthracite mb-3">
                Une Proximité &amp; Écoute Totale
              </h4>
              <p className="text-stone text-sm leading-relaxed">
                Parce que chaque client est unique, nous vous accompagnons
                personnellement par WhatsApp pour choisir votre taille, ajuster
                une coupe ou suivre votre commande pas à pas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contacts & Coordonnées */}
      <section
        id="contact"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 scroll-mt-24"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Service Client Disponible</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-anthracite mb-4">
            Contactez Elegance By Michou
          </h2>
          <p className="text-stone text-sm sm:text-base leading-relaxed">
            Une question sur un modèle, une taille ou une commande sur-mesure ?
            Nous vous répondons avec le plus grand plaisir.
          </p>
        </div>

        {/* Grille des moyens de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border-2 border-green-500/30 hover:border-green-500 p-6 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle size={26} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-anthracite mb-1">
                WhatsApp Direct
              </h3>
              <p className="text-xs text-stone mb-3">
                Réponse rapide en quelques minutes
              </p>
              <p className="text-sm font-bold text-anthracite font-mono">
                +221 78 871 00 69
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#25D366] uppercase tracking-wider group-hover:gap-3 transition-all">
              Écrire sur WhatsApp →
            </span>
          </a>

          {/* Instagram Officiel */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-stone/20 hover:border-[#E1306C] p-6 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                <Instagram size={24} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-anthracite mb-1">
                Instagram
              </h3>
              <p className="text-xs text-stone mb-2">
                Communauté &amp; Stories
              </p>
              <p className="text-sm font-bold text-anthracite font-mono">
                @elegance_by_michou
              </p>
              <p className="text-xs text-stone mt-0.5">
                Arrivages &amp; Looks exclusifs
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#E1306C] uppercase tracking-wider group-hover:gap-3 transition-all">
              Rejoindre sur Instagram →
            </span>
          </a>

          {/* Localisation */}
          <a
            href="#google-map"
            className="bg-white border border-stone/20 hover:border-terracotta p-6 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-anthracite/10 text-anthracite flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-anthracite mb-1">
                Localisation
              </h3>
              <p className="text-xs text-stone mb-2">Atelier &amp; Boutique</p>
              <p className="text-sm font-bold text-anthracite">Liberté 6</p>
              <p className="text-xs text-stone mt-0.5">
                En face Camp Pénal, Dakar
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-terracotta uppercase tracking-wider group-hover:gap-3 transition-all">
              Voir sur la carte ↓
            </span>
          </a>

          {/* Horaires */}
          <div className="bg-white border border-stone/20 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="font-serif text-lg font-semibold text-anthracite mb-1">
                Horaires d&apos;Ouverture
              </h3>
              <p className="text-xs text-stone mb-3">Disponibilité continue</p>
              <p className="text-sm font-bold text-anthracite">7 jours sur 7</p>
              <p className="text-xs text-stone mt-0.5">De 09h00 à 22h00 GMT</p>
            </div>
            <span className="mt-6 text-xs text-green-700 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Ouvert
              aujourd&apos;hui
            </span>
          </div>
        </div>

        {/* Section Google Maps interactive */}
        <div id="google-map" className="mb-14 scroll-mt-24">
          <div className="bg-white border border-stone/20 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {/* Header de la carte */}
            <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone/15 bg-[#FAF9F6]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold uppercase tracking-wider mb-2">
                  <MapPin size={13} />
                  <span>Emplacement de l&apos;Atelier &amp; Boutique</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-anthracite">
                  Liberté 6, en face Camp Pénal
                </h3>
                <p className="text-stone text-sm mt-1">
                  Dakar, Sénégal — Repère : Juste en face de l&apos;entrée
                  principale du Camp Pénal de Liberté 6
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Camp+P%C3%A9nal+Libert%C3%A9+6+Dakar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-none bg-anthracite hover:bg-terracotta text-ivory text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Navigation size={14} />
                  <span>Ouvrir l&apos;Itinéraire GPS</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Iframe Google Maps */}
            <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] bg-stone/10">
              <iframe
                title="Carte Google Maps Elegance By Michou - Liberté 6 en face Camp Pénal Dakar"
                src="https://maps.google.com/maps?q=Camp%20P%C3%A9nal%2C%20Libert%C3%A9%206%2C%20Dakar&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Informations pratiques sous la carte */}
            <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone border-t border-stone/15">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="text-base">📍</span>
                <span>
                  <strong>Accès facile :</strong> En plein cœur de Liberté 6, en
                  face du Camp Pénal. Atelier et essayages ouverts 7j/7 de 9h à
                  22h.
                </span>
              </div>
              <div className="flex items-center gap-2 text-center sm:text-right font-medium text-anthracite">
                <span>
                  🚚 Livraison express également disponible partout à Dakar et
                  dans les régions !
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Encadré d'invitation au dialogue */}
        <div className="bg-anthracite text-ivory rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl text-center md:text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-terracotta">
              Échangez directement avec nous
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold">
              Prêt(e) à trouver votre tenue idéale ?
            </h3>
            <p className="text-stone text-sm leading-relaxed">
              Consultez nos collections en ligne ou envoyez-nous un message
              WhatsApp pour des conseils personnalisés sur les tailles et les
              coloris.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 flex-shrink-0 w-full md:w-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-none bg-[#25D366] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#20bd5a] transition-colors shadow-md"
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-none bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-opacity shadow-md"
            >
              <Instagram size={16} />
              <span>Instagram</span>
            </a>
            <Link
              href="/#catalogue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-none border border-ivory/30 text-ivory hover:border-terracotta hover:text-terracotta text-xs font-semibold tracking-widest uppercase transition-colors"
            >
              <span>Boutique</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
