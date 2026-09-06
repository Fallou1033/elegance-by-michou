'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    src: '/images/products/Mini%20robe%20brod%C3%A9%20anglais%20100%25%20coton/WhatsApp%20Image%202026-09-05%20at%2013.59.50.jpeg',
    alt: 'Mini robe brodée anglaise 100% coton - Élégance féminine',
    productName: 'Mini robe brodé anglais 100% coton',
    gender: 'Femme',
    category: 'Robes',
    // Mobile: subject well framed. Desktop: pushed rightwards to leave breathing space for text
    objectPosition: 'object-[75%_8%] md:object-[90%_10%]',
  },
  {
    src: '/images/products/Grand%20boubou/WhatsApp%20Image%202026-09-05%20at%2014.00.52.jpeg',
    alt: 'Grand boubou sénégalais traditionnel en bazin bleu argenté',
    productName: 'Grand boubou',
    gender: 'Homme',
    category: 'Grands Boubous',
    // Arches in top section, head comfortably visible with more boubou fabric showing
    objectPosition: 'object-[65%_18%] md:object-[80%_28%]',
  },
  {
    src: '/images/products/Safari%20Supercen/WhatsApp%20Image%202026-09-05%20at%2014.01.30%20(1).jpeg',
    alt: 'Ensemble Safari Supercen noir épuré',
    productName: 'Safari Supercen',
    gender: 'Homme',
    category: 'Ensembles Safari',
    // Head and beard near top edge, placed on right side
    objectPosition: 'object-[68%_4%] md:object-[82%_5%]',
  },
  {
    src: '/images/products/ensemble%20lin%20homme/WhatsApp%20Image%202026-09-05%20at%2013.53.11.jpeg',
    alt: 'Ensemble lin homme chemise à rayures et pantalon fluide',
    productName: 'ensemble lin homme',
    gender: 'Homme',
    category: 'Ensembles Lin',
    // Fade haircut & sunglasses near top, shifted right
    objectPosition: 'object-[68%_4%] md:object-[84%_5%]',
  },
];

export default function HeroBanner({ initialSlide = 0 }: { initialSlide?: number }) {
  const [currentSlide, setCurrentSlide] = useState(
    initialSlide >= 0 && initialSlide < HERO_SLIDES.length ? initialSlide : 0
  );

  useEffect(() => {
    // If a specific slide was forced (initialSlide > 0 or in URL), pin it for inspection
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('slide')) return;
    }

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[75vh] md:h-[88vh] min-h-[560px] md:min-h-[640px] overflow-hidden bg-anthracite">
      {/* Background Slides with Crossfade */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover ${slide.objectPosition}`}
          />
        </div>
      ))}

      {/* Localized dark overlay: opaque behind text on the left, completely clear on the right so clothing is luminous and vibrant */}
      <div className="absolute inset-0 bg-gradient-to-r from-anthracite/90 via-anthracite/60 md:via-anthracite/35 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-anthracite/85 via-transparent to-transparent md:hidden z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-xl">
          <p className="text-terracotta text-xs font-medium tracking-[0.3em] uppercase mb-3 md:mb-4">
            Collection Automne 2026
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-ivory leading-tight mb-4 drop-shadow-sm">
            L&apos;Élégance<br />au Naturel
          </h1>
          <p className="text-ivory/90 text-base md:text-lg mb-8 leading-relaxed">
            Des pièces intemporelles pour femmes et hommes, <br className="hidden md:block" />
            livrées partout au Sénégal.
          </p>
          <Link
            href="#catalogue"
            className="inline-flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-terracotta/90 transition-all duration-200 hover:gap-4 shadow-lg"
          >
            Découvrir la collection
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 mt-8">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? 'w-8 bg-terracotta'
                  : 'w-2 bg-ivory/40 hover:bg-ivory/70'
              }`}
              aria-label={`Afficher la photo ${idx + 1} (${slide.productName})`}
              title={`${slide.gender} · ${slide.productName}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
