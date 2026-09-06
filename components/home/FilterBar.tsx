'use client';

interface FilterBarProps {
  activeCategory: string;
  activeGender: string;
  onCategoryChange: (cat: string) => void;
  onGenderChange: (gender: string) => void;
  productCount: number;
}

const CATEGORIES = [
  { value: 'all', label: 'Tout' },
  { value: 'robes', label: 'Robes' },
  { value: 'jupes', label: 'Jupes' },
  { value: 'hauts', label: 'Hauts & Tops' },
  { value: 'pantalons', label: 'Pantalons' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'homme', label: 'Homme' },
];

const GENDERS = [
  { value: 'all', label: 'Tous' },
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
];

export default function FilterBar({
  activeCategory,
  activeGender,
  onCategoryChange,
  onGenderChange,
  productCount,
}: FilterBarProps) {
  return (
    <div className="py-6 border-b border-stone/10">
      <div className="flex flex-col gap-4">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-4 py-2 text-xs font-medium tracking-wider uppercase border transition-all duration-150 ${
                activeCategory === cat.value
                  ? 'bg-anthracite text-ivory border-anthracite'
                  : 'border-stone/30 text-stone hover:border-anthracite hover:text-anthracite'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gender filter + count */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {GENDERS.map(g => (
              <button
                key={g.value}
                onClick={() => onGenderChange(g.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                  activeGender === g.value
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'border-stone/30 text-stone hover:border-terracotta hover:text-terracotta'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone">
            {productCount} article{productCount > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
