'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ProductColor, Product } from '@/types';

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Unique'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('robes');
  const [gender, setGender] = useState<any>('femme');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [badge, setBadge] = useState<any>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#C4704F');
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [care, setCare] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.success) {
          const found = data.products.find((p: Product) => p.id === id || p.slug === id);
          if (found) {
            setName(found.name);
            setCategory(found.category);
            setGender(found.gender);
            setPrice(found.price);
            setOriginalPrice(found.originalPrice || '');
            setBadge(found.badge || '');
            setSelectedSizes(found.sizes || ['S', 'M', 'L']);
            setColors(found.colors || []);
            setImages(found.images?.length > 0 ? found.images : ['']);
            setDescription(found.description || '');
            setMaterial(found.material || '');
            setCare(found.care || '');
          } else {
            setError('Produit introuvable.');
          }
        }
      } catch (e) {
        setError('Impossible de charger le produit.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, val: string) => {
    setImages(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleAddImageField = () => {
    setImages(prev => [...prev, '']);
  };

  const handleRemoveImageField = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du produit est requis.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Veuillez saisir un prix valide.');
      return;
    }

    const cleanImages = images.map(img => img.trim()).filter(Boolean);
    if (cleanImages.length === 0) {
      cleanImages.push('/images/logo-em.png');
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: name.trim(),
          category,
          gender,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          badge: badge || undefined,
          sizes: selectedSizes,
          colors: colors.length > 0 ? colors : [{ name: 'Standard', hex: '#C4704F' }],
          images: cleanImages,
          description: description.trim(),
          material: material.trim(),
          care: care.trim(),
        }),
      });

      if (res.ok) {
        router.push('/admin/produits');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la mise à jour.');
      }
    } catch (err: any) {
      setError('Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        <p className="text-xs text-stone font-medium">Chargement de la fiche produit...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produits"
            className="p-2 bg-white rounded-xl border border-stone/20 text-stone hover:text-anthracite transition-colors"
            title="Retour au catalogue"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-anthracite">
              Modifier l&apos;article « {name} »
            </h1>
            <p className="text-xs text-stone">ID technique : {id}</p>
          </div>
        </div>

        <Link
          href={`/produits/${id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-terracotta font-semibold hover:underline"
        >
          <span>Voir sur le site</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl p-3.5 flex items-start gap-2.5">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <div className="bg-white p-6 rounded-2xl border border-stone/15 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-anthracite border-b border-stone/10 pb-2">
            1. Informations Principales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                Nom de la création *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone/20 focus:border-terracotta outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone/20 bg-white focus:border-terracotta outline-none"
              >
                <option value="robes">Robes</option>
                <option value="ensembles">Ensembles et Tradi-Moderne</option>
                <option value="homme">Mode Masculine (Costumes et Boubous)</option>
                <option value="hauts">Hauts et Chemises</option>
                <option value="pantalons">Pantalons</option>
                <option value="jupes">Jupes</option>
                <option value="accessoires">Accessoires</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                Genre / Rayon *
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone/20 bg-white focus:border-terracotta outline-none"
              >
                <option value="femme">Mode Femme</option>
                <option value="homme">Mode Homme</option>
                <option value="unisexe">Unisexe</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tarification & Badges */}
        <div className="bg-white p-6 rounded-2xl border border-stone/15 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-anthracite border-b border-stone/10 pb-2">
            2. Prix et Promotions (en FCFA)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                Prix de Vente (FCFA) *
              </label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone/20 focus:border-terracotta outline-none font-bold text-anthracite text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone mb-1.5">
                Prix Barré / Promo
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone/20 focus:border-terracotta outline-none text-stone"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                Badge d&apos;accroche
              </label>
              <select
                value={badge}
                onChange={e => setBadge(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone/20 bg-white focus:border-terracotta outline-none"
              >
                <option value="">Aucun badge</option>
                <option value="Nouveau">✨ Nouveau</option>
                <option value="Promo">🏷️ Promo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tailles & Couleurs */}
        <div className="bg-white p-6 rounded-2xl border border-stone/15 shadow-xs space-y-5">
          <h2 className="font-serif text-base font-semibold text-anthracite border-b border-stone/10 pb-2">
            3. Tailles et Couleurs
          </h2>

          {/* Tailles */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-2">
              Tailles disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SIZES.map(size => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-anthracite text-white border-anthracite shadow-xs'
                        : 'bg-stone/5 text-stone border-stone/20 hover:border-anthracite'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Couleurs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-2">
              Couleurs proposées
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-[#FAF9F6] border border-stone/20 px-3 py-1.5 rounded-xl text-xs"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone/30"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="font-medium text-anthracite">{color.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(idx)}
                    className="text-stone hover:text-red-500 ml-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Ajouter une couleur */}
            <div className="flex items-center gap-2 bg-stone/5 p-2.5 rounded-xl max-w-md">
              <input
                type="color"
                value={newColorHex}
                onChange={e => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                title="Choisir la couleur"
              />
              <input
                type="text"
                value={newColorName}
                onChange={e => setNewColorName(e.target.value)}
                placeholder="Nom (ex: Bleu Nuit, Émeraude...)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone/20 bg-white focus:border-terracotta outline-none"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="bg-anthracite text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-terracotta transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white p-6 rounded-2xl border border-stone/15 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone/10 pb-2">
            <h2 className="font-serif text-base font-semibold text-anthracite">
              4. Photos de l&apos;Article
            </h2>
            <button
              type="button"
              onClick={handleAddImageField}
              className="text-xs font-semibold text-terracotta hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Ajouter une image
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative w-10 h-12 rounded-lg bg-stone/10 border border-stone/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt="Aperçu"
                      fill
                      className="object-cover"
                      sizes="40px"
                      onError={() => {}}
                    />
                  ) : (
                    <ImageIcon size={16} className="text-stone/40" />
                  )}
                </div>
                <input
                  type="text"
                  value={img}
                  onChange={e => handleImageChange(idx, e.target.value)}
                  placeholder={`Lien de la photo ${idx + 1}`}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone/20 focus:border-terracotta outline-none"
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImageField(idx)}
                    className="p-2 text-stone hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Description & Savoir-faire */}
        <div className="bg-white p-6 rounded-2xl border border-stone/15 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-anthracite border-b border-stone/10 pb-2">
            5. Détails et Matières
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
              Description de la pièce
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone/20 focus:border-terracotta outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                Matière / Tissu
              </label>
              <input
                type="text"
                value={material}
                onChange={e => setMaterial(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone/20 focus:border-terracotta outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-anthracite mb-1.5">
                Conseils d&apos;Entretien
              </label>
              <input
                type="text"
                value={care}
                onChange={e => setCare(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone/20 focus:border-terracotta outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions de Soumission */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/produits"
            className="px-5 py-3 rounded-xl border border-stone/20 text-stone hover:text-anthracite text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white px-7 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                <span>Mettre à jour la fiche</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
