'use client';
import { useState, useEffect, useRef } from 'react';
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
  Check,
  Camera,
  Upload,
  Star,
  Loader2,
} from 'lucide-react';
import { ProductColor, Product } from '@/types';
import { detectColorName, POPULAR_COLOR_PRESETS } from '@/lib/colors';
import { compressImageFile } from '@/lib/image-compression';

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
  const [newColorHex, setNewColorHex] = useState('#C4704F');
  const [newColorName, setNewColorName] = useState('Terracotta');
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleColorHexChange = (hex: string) => {
    setNewColorHex(hex);
    setNewColorName(detectColorName(hex));
  };

  const handleSelectPreset = (preset: { name: string; hex: string }) => {
    setNewColorHex(preset.hex);
    setNewColorName(preset.name);
    // Ajouter immédiatement à la liste des couleurs si elle n'y figure pas encore
    setColors(prev => {
      if (prev.some(c => c.name.toLowerCase() === preset.name.toLowerCase())) {
        return prev;
      }
      return [...prev, { name: preset.name, hex: preset.hex }];
    });
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors(prev => {
      if (prev.some(c => c.name.toLowerCase() === newColorName.trim().toLowerCase())) {
        return prev;
      }
      return [...prev, { name: newColorName.trim(), hex: newColorHex }];
    });
    setNewColorHex('#1A1A1A');
    setNewColorName('Noir Intense');
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const newCompressedImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressed = await compressImageFile(file);
          newCompressedImages.push(compressed);
        }
      }

      setImages(prev => {
        const cleanPrev = prev.filter(img => img && img.trim().length > 0);
        return [...cleanPrev, ...newCompressedImages];
      });
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du traitement de la photo.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
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

    // Inclure automatiquement la couleur du sélecteur si elle n'a pas encore été ajoutée via le bouton
    const finalColors = [...colors];
    if (
      newColorName.trim() &&
      !finalColors.some(c => c.name.toLowerCase() === newColorName.trim().toLowerCase())
    ) {
      finalColors.push({ name: newColorName.trim(), hex: newColorHex });
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
          colors: finalColors.length > 0 ? finalColors : [{ name: 'Standard', hex: '#C4704F' }],
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

            {/* Suggestions de teintes rapides en 1 clic */}
            <div className="mb-3">
              <span className="text-[11px] text-stone font-medium block mb-1.5">
                Couleurs populaires en un clic (cliquez pour ajouter directement) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_COLOR_PRESETS.map(preset => {
                  const isConfigured = colors.some(
                    c => c.name.toLowerCase() === preset.name.toLowerCase()
                  );
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                        isConfigured
                          ? 'border-green-600 bg-green-50 text-green-800 font-semibold shadow-xs'
                          : newColorHex.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-terracotta bg-terracotta/10 text-anthracite font-bold shadow-xs'
                          : 'border-stone/20 bg-white text-stone hover:text-anthracite hover:border-stone/40'
                      }`}
                      title={
                        isConfigured
                          ? 'Couleur déjà ajoutée au produit'
                          : 'Cliquez pour ajouter directement cette couleur'
                      }
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                      {isConfigured && <Check size={12} className="text-green-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sélecteur de couleur personnalisé avec nom automatique */}
            <div className="bg-stone/5 p-3 rounded-xl border border-stone/15 max-w-lg space-y-2">
              <span className="text-[11px] text-stone font-medium block">
                Ou choisissez n&apos;importe quelle couleur personnalisée (le nom s&apos;affiche automatiquement) :
              </span>
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={e => handleColorHexChange(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-stone/30 bg-white p-0.5 shadow-xs"
                    title="Cliquez pour changer la teinte"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={e => setNewColorName(e.target.value)}
                    placeholder="Nom automatique de la couleur"
                    className="w-full pl-3 pr-20 py-2.5 text-xs rounded-xl border border-stone/20 bg-white focus:border-terracotta outline-none font-semibold text-anthracite"
                  />
                  <span className="text-[10px] text-stone font-mono absolute right-3 top-1/2 -translate-y-1/2 uppercase bg-stone/10 px-1.5 py-0.5 rounded">
                    {newColorHex}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="bg-anthracite hover:bg-terracotta text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-xs"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white p-6 rounded-2xl border border-stone/15 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/10 pb-3">
            <div>
              <h2 className="font-serif text-base font-semibold text-anthracite flex items-center gap-2">
                <span>4. Photos de l&apos;Article</span>
                <span className="text-xs font-normal text-stone font-sans">
                  ({images.filter(img => img && img.trim()).length} photo{images.filter(img => img && img.trim()).length > 1 ? 's' : ''})
                </span>
              </h2>
              <p className="text-xs text-stone mt-0.5">
                La première photo sera celle affichée en couverture dans le catalogue.
              </p>
            </div>

            {/* Input file caché déclenché au clic sur mobile et PC */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="edit-product-photo-upload"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isCompressing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <span>Ajouter des photos</span>
                </>
              )}
            </button>
          </div>

          {/* Zone d'importation directe / Glisser-déposer */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone/30 hover:border-terracotta hover:bg-stone/5 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
          >
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-anthracite group-hover:text-terracotta transition-colors">
                  Cliquez ici pour choisir des photos depuis votre téléphone ou ordinateur
                </p>
                <p className="text-xs text-stone mt-1">
                  Accès direct à votre galerie photo ou prise de vue par appareil photo (JPG, PNG, WEBP)
                </p>
              </div>
            </div>
          </div>

          {/* Grille visuelle des photos ajoutées */}
          {images.filter(img => img && img.trim()).length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-anthracite uppercase tracking-wider block">
                Photos de cet article (la 1ère est la principale) :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images
                  .map((img, idx) => ({ img, idx }))
                  .filter(item => item.img && item.img.trim())
                  .map(({ img, idx }) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl border border-stone/20 overflow-hidden bg-stone/5 flex flex-col aspect-[3/4] shadow-xs hover:border-terracotta/50 transition-all"
                    >
                      <img
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover object-top"
                      />

                      {/* Badge Photo principale ou bouton pour la définir */}
                      {idx === 0 ? (
                        <span className="absolute top-2 left-2 bg-anthracite text-ivory text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs z-10 flex items-center gap-1">
                          <Star size={10} className="fill-terracotta text-terracotta" />
                          Principale
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleSetPrimaryImage(idx);
                          }}
                          className="absolute top-2 left-2 bg-black/60 hover:bg-terracotta text-white text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs"
                          title="Définir comme photo principale"
                        >
                          Mettre en 1er
                        </button>
                      )}

                      {/* Bouton supprimer */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveImageField(idx);
                        }}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white text-stone p-1.5 rounded-lg shadow-xs transition-colors z-10"
                        title="Supprimer cette photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone italic text-center py-2">
              Aucune photo enregistrée pour cet article. Ajoutez-en au moins une pour la vitrine.
            </p>
          )}

          {/* Option avancée : ajouter manuellement par URL */}
          <details className="text-xs text-stone group border-t border-stone/10 pt-3">
            <summary className="cursor-pointer font-medium hover:text-terracotta transition-colors list-none flex items-center gap-1.5">
              <span>+ Option avancée : ajouter manuellement un lien web (URL)</span>
            </summary>
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... ou /images/products/..."
                  id="edit-manual-url-input"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone/20 focus:border-terracotta outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        setImages(prev => [...prev.filter(img => img && img.trim()), val]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('edit-manual-url-input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      setImages(prev => [...prev.filter(img => img && img.trim()), input.value.trim()]);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-stone/10 hover:bg-stone/20 text-anthracite rounded-xl font-semibold transition-colors"
                >
                  Ajouter le lien
                </button>
              </div>
            </div>
          </details>
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
