'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { products } from '@/data/products';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

export default function FavoritesPage() {
  const { favorites, clearFavorites, isLoaded } = useFavorites();
  const [allProducts, setAllProducts] = useState<Product[]>(products);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Produits filtrés correspondant aux IDs dans les favoris
  const favoritedProducts = useMemo(() => {
    return allProducts.filter(p => favorites.includes(p.id));
  }, [favorites, allProducts]);

  // Autres produits suggérés si la liste est vide ou courte
  const suggestedProducts = useMemo(() => {
    return allProducts.filter(p => !favorites.includes(p.id)).slice(0, 4);
  }, [favorites, allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 min-h-[70vh]">
      {/* Fil d'Ariane / Retour */}
      <nav className="mb-6 md:mb-8">
        <Link
          href="/#catalogue"
          className="inline-flex items-center gap-2 text-stone text-sm font-medium hover:text-terracotta transition-colors py-1.5 px-2 -ml-2 rounded-md hover:bg-stone/10 w-fit group"
        >
          <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span>Retour à la boutique</span>
        </Link>
      </nav>

      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-stone/15 gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-1.5 rounded-full bg-terracotta/10 text-terracotta">
              <Heart size={18} className="fill-terracotta" />
            </span>
            <p className="text-terracotta text-xs font-semibold uppercase tracking-[0.25em]">
              Vos coups de cœur
            </p>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-anthracite tracking-tight">
            Mes Favoris
          </h1>
          <p className="text-stone text-sm mt-1.5">
            Enregistrez vos pièces préférées pour les retrouver et les commander à tout moment.
          </p>
        </div>

        {/* Compteur et bouton vider */}
        {favoritedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs bg-stone/15 text-anthracite font-semibold px-3 py-1.5 rounded-full">
              {favoritedProducts.length} article{favoritedProducts.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={clearFavorites}
              className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-red-500 transition-colors py-1 px-2.5 border border-stone/25 hover:border-red-300 rounded-xs"
              title="Vider tous mes favoris"
            >
              <Trash2 size={13} />
              <span>Tout effacer</span>
            </button>
          </div>
        )}
      </div>

      {/* État de chargement initial (SSR / hydration) */}
      {!isLoaded ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone">Chargement de vos favoris...</p>
        </div>
      ) : favoritedProducts.length === 0 ? (
        /* État vide */
        <div className="py-16 md:py-24 text-center max-w-md mx-auto flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mb-6 shadow-inner">
            <Heart size={38} className="stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-anthracite mb-2">
            Votre liste de favoris est vide
          </h2>
          <p className="text-stone text-sm leading-relaxed mb-8">
            Vous n&apos;avez pas encore ajouté d&apos;articles à vos favoris. Cliquez sur le petit cœur présent sur les photos des vêtements pour les retrouver ici plus tard !
          </p>
          <Link
            href="/#catalogue"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-terracotta text-white text-xs md:text-sm font-semibold tracking-widest uppercase hover:bg-terracotta/90 transition-all duration-200 shadow-md hover:gap-4"
          >
            <span>Découvrir la collection</span>
            <ArrowRight size={16} />
          </Link>

          {/* Suggestions si favoris vides */}
          {suggestedProducts.length > 0 && (
            <div className="w-full mt-20 pt-12 border-t border-stone/15 text-left">
              <h3 className="font-serif text-xl font-semibold text-anthracite mb-6 text-center">
                Articles tendance du moment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {suggestedProducts.slice(0, 2).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Grille des articles favoris */
        <div className="space-y-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {favoritedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Bannière d'incitation à l'achat */}
          <div className="bg-ivory border border-stone/20 rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-anthracite text-white flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={22} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-anthracite">
                  Prêt(e) à passer commande ?
                </h3>
                <p className="text-xs md:text-sm text-stone mt-0.5">
                  Vos favoris restent enregistrés sur cet appareil. Ajoutez-les au panier dès que vous êtes prêt(e) !
                </p>
              </div>
            </div>
            <Link
              href="/#catalogue"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-anthracite hover:text-terracotta border-b border-anthracite pb-1 hover:border-terracotta transition-colors flex-shrink-0"
            >
              <span>Continuer mes achats</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
