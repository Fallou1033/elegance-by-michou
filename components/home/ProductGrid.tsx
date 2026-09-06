'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import FilterBar from './FilterBar';
import { products } from '@/data/products';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGender, setActiveGender] = useState('all');

  // Sync URL params for filtering
  useEffect(() => {
    const gender = searchParams.get('gender');
    if (gender === 'homme') {
      setActiveGender('homme');
    } else if (gender === 'femme') {
      setActiveGender('femme');
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    const search = searchParams.get('search')?.toLowerCase();
    const badge = searchParams.get('badge');

    return products.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (activeGender !== 'all' && p.gender !== activeGender && !(activeGender === 'femme' && p.gender === 'unisexe')) return false;
      if (badge && p.badge !== badge) return false;
      if (search && !p.name.toLowerCase().includes(search) && !p.description.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [activeCategory, activeGender, searchParams]);

  return (
    <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-anthracite">
          Notre Collection
        </h2>
        {searchParams.get('search') && (
          <p className="text-stone mt-2 text-sm">
            Résultats pour « {searchParams.get('search')} »
          </p>
        )}
      </div>

      <FilterBar
        activeCategory={activeCategory}
        activeGender={activeGender}
        onCategoryChange={setActiveCategory}
        onGenderChange={setActiveGender}
        productCount={filteredProducts.length}
      />

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-stone text-lg">Aucun produit trouvé.</p>
            <p className="text-stone text-sm mt-2">Essayez d&apos;autres filtres.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={`${product.id}-${activeCategory}-${activeGender}`}
              product={product}
            />
          ))
        )}
      </div>
    </section>
  );
}
