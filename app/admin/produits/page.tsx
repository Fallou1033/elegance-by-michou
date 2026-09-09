'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  // État pour édition rapide de prix en ligne
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  // État suppression
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        let list = data.products;
        try {
          const cached = localStorage.getItem('admin_local_products');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const map = new Map<string, Product>();
              list.forEach((p: Product) => map.set(p.id, p));
              parsed.forEach((p: Product) => map.set(p.id, p));
              list = Array.from(map.values());
            }
          }
        } catch {}
        setProducts(list);
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStartEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setNewPrice(product.price);
  };

  const handleSavePrice = async (product: Product) => {
    if (!newPrice || newPrice <= 0) return;
    setIsSavingPrice(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          price: Number(newPrice),
        }),
      });
      if (res.ok) {
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, price: Number(newPrice) } : p))
        );
        setEditingPriceId(null);
      }
    } catch (e) {
      console.error('Erreur mise à jour prix:', e);
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'article « ${name} » ?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesGender = selectedGender === 'all' || p.gender === selectedGender;

      return matchesSearch && matchesCat && matchesGender;
    });
  }, [products, searchQuery, selectedCategory, selectedGender]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        <p className="text-xs text-stone font-medium">Chargement du catalogue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-anthracite">
            Catalogue et Gestion des Prix
          </h1>
          <p className="text-xs sm:text-sm text-stone mt-1">
            Gérez vos articles, ajustez vos tarifs de vente et ajoutez de nouvelles pièces.
          </p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-all shrink-0"
        >
          <PlusCircle size={16} />
          Ajouter un produit
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone/15 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, matière..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone/20 focus:border-terracotta outline-none transition-all"
            />
          </div>

          {/* Catégories */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-stone/20 bg-white focus:border-terracotta outline-none capitalize"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Genre */}
          <div>
            <select
              value={selectedGender}
              onChange={e => setSelectedGender(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-stone/20 bg-white focus:border-terracotta outline-none"
            >
              <option value="all">Tous les genres (Femme et Homme)</option>
              <option value="femme">Mode Femme</option>
              <option value="homme">Mode Homme</option>
              <option value="unisexe">Unisexe</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-stone pt-2 border-t border-stone/10">
          <span>{filteredProducts.length} article{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}</span>
          {(searchQuery || selectedCategory !== 'all' || selectedGender !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedGender('all');
              }}
              className="text-terracotta hover:underline font-medium"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Table des Produits */}
      <div className="bg-white rounded-2xl border border-stone/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-stone uppercase tracking-wider font-semibold border-b border-stone/10">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix de Vente</th>
                <th className="py-3 px-4">Tailles et Couleurs</th>
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {filteredProducts.map(product => {
                const isEditingPrice = editingPriceId === product.id;
                const isDeleting = deletingId === product.id;

                return (
                  <tr key={product.id} className="hover:bg-stone/5 transition-colors">
                    {/* Article & Image */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-stone/10 shrink-0 border border-stone/15">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone text-[10px]">
                              N/A
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/produits/${product.id}`}
                            target="_blank"
                            className="font-semibold text-anthracite hover:text-terracotta transition-colors flex items-center gap-1 group"
                          >
                            <span>{product.name}</span>
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <span className="text-[11px] text-stone block">
                            {product.gender === 'femme' ? 'Femme' : product.gender === 'homme' ? 'Homme' : 'Unisexe'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-stone/10 text-anthracite px-2.5 py-1 rounded-md text-[11px] font-medium capitalize">
                        {product.categoryLabel || product.category}
                      </span>
                    </td>

                    {/* Prix & Édition Rapide */}
                    <td className="py-3.5 px-4">
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={newPrice}
                            onChange={e => setNewPrice(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-terracotta rounded text-xs font-semibold focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(product)}
                            disabled={isSavingPrice}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Valider le prix"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 text-stone hover:bg-stone/10 rounded"
                            title="Annuler"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleStartEditPrice(product)}>
                          <div>
                            <span className="font-bold text-anthracite text-sm block">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-stone line-through block">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditPrice(product);
                            }}
                            className="p-1 text-stone group-hover:text-terracotta opacity-0 group-hover:opacity-100 transition-all"
                            title="Modifier le prix"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Tailles & Couleurs */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {product.sizes?.map(size => (
                            <span key={size} className="px-1.5 py-0.5 bg-stone/10 rounded text-[10px] text-stone font-mono">
                              {size}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          {product.colors?.slice(0, 4).map(c => (
                            <span
                              key={c.name}
                              title={c.name}
                              className="w-3 h-3 rounded-full border border-stone/30 inline-block"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          {product.colors && product.colors.length > 4 && (
                            <span className="text-[10px] text-stone">+{product.colors.length - 4}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Badge */}
                    <td className="py-3.5 px-4">
                      {product.badge ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            product.badge === 'Promo'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-stone/15 text-anthracite'
                          }`}
                        >
                          <Tag size={10} />
                          {product.badge}
                        </span>
                      ) : (
                        <span className="text-stone text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/produits/${product.id}`}
                          className="p-2 text-stone hover:text-terracotta hover:bg-stone/10 rounded-lg transition-colors"
                          title="Modifier la fiche complète"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          disabled={isDeleting}
                          className="p-2 text-stone hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer l'article"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
