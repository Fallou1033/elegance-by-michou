'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import FilterBar from './FilterBar';
import { products } from '@/data/products';
import { Product } from '@/types';
import { BULK_DISCOUNT_RULES } from '@/lib/utils';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGender, setActiveGender] = useState('all');
  const [activeBadge, setActiveBadge] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Sync URL params for filtering and scroll smoothly to catalogue
  useEffect(() => {
    const gender = searchParams.get('gender');
    const badge = searchParams.get('badge');

    if (gender === 'homme') {
      setActiveGender('homme');
      setActiveCategory('all');
      setActiveBadge(null);
    } else if (gender === 'femme') {
      setActiveGender('femme');
      setActiveCategory('all');
      setActiveBadge(null);
    } else {
      setActiveGender('all');
    }

    if (badge) {
      setActiveBadge(badge);
      setActiveCategory('all');
      if (badge === 'Nouveau' || badge === 'Promo') {
        setActiveGender('all');
      }
    } else if (!gender) {
      setActiveBadge(null);
    }

    const search = searchParams.get('search');

    // Scroll into view if navigation came from header filter or search
    if (gender || badge || search || (typeof window !== 'undefined' && window.location.hash === '#catalogue')) {
      setTimeout(() => {
        const el = document.getElementById('catalogue');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    const search = searchParams.get('search')?.toLowerCase();
    const badge = searchParams.get('badge') || activeBadge;

    return productsList.filter(p => {
      // Filtre badge (Promotions ou Nouveautés)
      if (badge === 'Promo') {
        const isPromo =
          p.badge === 'Promo' ||
          Boolean(p.originalPrice && p.originalPrice > p.price) ||
          Boolean(BULK_DISCOUNT_RULES[p.id]);
        if (!isPromo) return false;
      } else if (badge === 'Nouveau') {
        if (p.badge !== 'Nouveau' && p.badge !== 'Promo') return false;
      }

      // Filtre catégorie
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;

      // Filtre genre
      if (
        activeGender !== 'all' &&
        p.gender !== activeGender &&
        !(activeGender === 'femme' && p.gender === 'unisexe')
      ) {
        return false;
      }

      // Recherche textuelle
      if (
        search &&
        !p.name.toLowerCase().includes(search) &&
        !p.description.toLowerCase().includes(search)
      ) {
        return false;
      }

      return true;
    });
  }, [activeCategory, activeGender, activeBadge, searchParams, productsList]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveBadge(null);
  };

  const handleGenderChange = (gen: string) => {
    setActiveGender(gen);
    setActiveBadge(null);
  };

  const handleResetFilters = () => {
    setActiveBadge(null);
    setActiveGender('all');
    setActiveCategory('all');
    router.push('/#catalogue');
  };

  return (
    <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-anthracite">
            {searchParams.get('search')
              ? `Résultats pour « ${searchParams.get('search')} »`
              : activeBadge === 'Promo'
              ? 'Nos Promotions & Offres Spéciales'
              : activeBadge === 'Nouveau'
              ? 'Nouveautés Collection 2026'
              : activeGender === 'femme'
              ? 'Collection Femme'
              : activeGender === 'homme'
              ? 'Collection Homme'
              : 'Notre Collection'}
          </h2>
          {searchParams.get('search') ? (
            <p className="text-stone mt-2 text-sm">
              {filteredProducts.length} article{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''} pour votre recherche
            </p>
          ) : activeBadge === 'Promo' ? (
            <p className="text-terracotta mt-2 text-sm font-medium">
              Profitez de réductions exclusives et de tarifs volume sur vos articles préférés !
            </p>
          ) : null}
        </div>

        {(searchParams.get('search') || activeBadge || activeGender !== 'all' || activeCategory !== 'all') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-stone hover:text-terracotta underline uppercase tracking-wider self-start sm:self-auto cursor-pointer"
          >
            Voir toute la collection
          </button>
        )}
      </div>

      <FilterBar
        activeCategory={activeCategory}
        activeGender={activeGender}
        onCategoryChange={handleCategoryChange}
        onGenderChange={handleGenderChange}
        productCount={filteredProducts.length}
      />

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-stone text-lg">Aucun article ne correspond à cette sélection.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-6 py-2.5 bg-anthracite text-white text-xs font-medium uppercase tracking-wider hover:bg-terracotta transition-colors"
            >
              Afficher toute la boutique
            </button>
          </div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={`${product.id}-${activeCategory}-${activeGender}-${activeBadge || 'all'}`}
              product={product}
            />
          ))
        )}
      </div>
    </section>
  );
}
