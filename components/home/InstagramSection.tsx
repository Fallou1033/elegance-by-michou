import Image from 'next/image';
import { Instagram, ExternalLink, Heart } from 'lucide-react';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@/data/products';

const INSTAGRAM_POSTS = [
  {
    image: '/images/products/Costume%20africain/WhatsApp%20Image%202026-09-05%20at%2014.06.38.jpeg',
    title: 'Costume Africain de Prestige',
    likes: '142',
  },
  {
    image: '/images/products/Mini%20robe%20brod%C3%A9%20anglais%20100%25%20coton/WhatsApp%20Image%202026-09-05%20at%2014.05.00%20(1).jpeg',
    title: 'Mini Robe Broderie Anglaise',
    likes: '238',
  },
  {
    image: '/images/products/Grand%20boubou/WhatsApp%20Image%202026-09-05%20at%2014.00.52.jpeg',
    title: 'Grand Boubou Cérémonie',
    likes: '315',
  },
  {
    image: '/images/products/ensemble%20lin%20homme/WhatsApp%20Image%202026-09-05%20at%2013.53.11%20(1).jpeg',
    title: 'Ensemble Pur Lin Homme',
    likes: '189',
  },
  {
    image: '/images/products/Tenue%20tradi-moderne%20ensemble%20100%25%20coton/WhatsApp%20Image%202026-09-05%20at%2013.58.06%20(1).jpeg',
    title: 'Ensemble Tradi-Moderne 100% Coton',
    likes: '204',
  },
  {
    image: '/images/products/Safari%20Supercen/WhatsApp%20Image%202026-09-05%20at%2014.01.30.jpeg',
    title: 'Ensemble Safari Supercen',
    likes: '167',
  },
];

export default function InstagramSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-stone/15 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-[#E1306C] text-xs font-semibold uppercase tracking-[0.2em] mb-3 hover:bg-rose-100 transition-colors"
          >
            <Instagram size={14} />
            <span>{INSTAGRAM_HANDLE}</span>
          </a>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-anthracite mb-4">
            Suivez Notre Univers sur Instagram
          </h2>
          <p className="text-stone text-sm sm:text-base leading-relaxed">
            Découvrez nos nouvelles créations en avant-première, les coulisses de nos ateliers dakarois et les looks de nos clients en story.
          </p>
        </div>

        {/* Grid des 6 photos Instagram */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
          {INSTAGRAM_POSTS.map((post, idx) => (
            <a
              key={idx}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-stone/10 shadow-xs block"
            >
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                <div className="flex justify-end">
                  <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-xs">
                    <Instagram size={14} className="text-white" />
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-medium leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-ivory/80 mt-1">
                    <Heart size={10} className="fill-rose-500 text-rose-500" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white text-xs font-bold uppercase tracking-widest hover:opacity-95 transition-opacity shadow-md hover:shadow-lg"
          >
            <Instagram size={16} />
            <span>Suivre {INSTAGRAM_HANDLE} sur Instagram</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
