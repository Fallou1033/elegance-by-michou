const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'products.ts');

/**
 * Generate a clean technical slug from folder name:
 * lowercase, no accents, spaces to hyphens, special chars removed
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}

/**
 * Natural sort for filenames (e.g. (1), (2), (10))
 */
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Pre-audited visual configurations for current known product folders
 */
const KNOWN_CONFIGS = {
  'costume-africain': {
    primaryImage: 'WhatsApp Image 2026-09-05 at 14.06.38.jpeg',
    hoverImage: 'WhatsApp Image 2026-09-05 at 14.05.27.jpeg',
    gender: 'homme',
    category: 'homme',
    categoryLabel: 'Costumes & Ensembles',
    price: 50000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Noir Impérial', hex: '#1A1A1A' },
      { name: 'Or & Bronze', hex: '#C5A059' },
      { name: 'Bleu Marine', hex: '#1F3A5F' }
    ],
    material: 'Tissu tailleur supérieur et broderies de prestige',
    care: 'Nettoyage à sec uniquement par un professionnel.',
    description: "Costume tailleur d'inspiration africaine avec col Mao/officier et boutonnage soigné. Une prestance incomparable pour vos grandes cérémonies et réceptions officielles."
  },
  'ensemble-lin-homme': {
    primaryImage: 'WhatsApp Image 2026-09-05 at 13.53.13 (4).jpeg',
    gender: 'homme',
    category: 'homme',
    categoryLabel: 'Ensembles Lin',
    price: 20000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Bleu Ciel', hex: '#87CEEB' },
      { name: 'Rayé Marron & Blanc', hex: '#A89F91' },
      { name: 'Blanc Pur', hex: '#FFFFFF' },
      { name: 'Terracotta', hex: '#C4704F' }
    ],
    material: '100% Lin naturel et respirant',
    care: 'Lavage en machine à 30°C. Séchage sur cintre.',
    description: "Ensemble estival chemise fluide et pantalon léger en pur lin. Coupe décontractée et ultra-confortable pour un style soigné même par forte chaleur."
  },
  'grand-boubou': {
    gender: 'homme',
    category: 'homme',
    categoryLabel: 'Grands Boubous',
    price: 170000,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: "Blanc d'Apparat", hex: '#FAF9F6' },
      { name: 'Bleu Roi', hex: '#2A52BE' }
    ],
    material: 'Bazin riche 100% coton teinté et brodé',
    care: 'Nettoyage à sec par un professionnel recommandé.',
    description: "Grand boubou 3 pièces de prestige sénégalais, orné de broderies artisanales géométriques fines. La quintessence de l'élégance africaine traditionnelle pour les grands événements."
  },
  'mini-robe-brode-anglais-100-coton': {
    gender: 'femme',
    category: 'robes',
    categoryLabel: 'Robes',
    price: 13000,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Blanc Broderie', hex: '#FAF9F6' }
    ],
    material: 'Broderie anglaise 100% coton',
    care: "Lavage délicat à 30°C ou à la main. Repassage doux sur l'envers.",
    description: "Mini robe en broderie anglaise délicate avec manches longues évasées et encolure volantée à lacets. Une silhouette romantique et chic, idéale en journée comme en soirée estivale."
  },
  'safari-supercen': {
    hoverImage: 'WhatsApp Image 2026-09-05 at 14.01.31 (1).jpeg',
    gender: 'homme',
    category: 'homme',
    categoryLabel: 'Costumes Safari',
    price: 30000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Noir Intense', hex: '#1A1A1A' },
      { name: 'Kaki Safari', hex: '#4B5320' },
      { name: 'Beige Sable', hex: '#C8B89A' }
    ],
    material: 'Tissu Supercent résistant et respirant',
    care: 'Lavage en machine à 30°C. Repassage doux.',
    description: "Costume safari contemporain composé d'une chemise à manches courtes avec poches plaquées à rabat et d'un pantalon assorti. Allure virile, moderne et sophistiquée."
  },
  'tenue-tradi-moderne-ensemble-100-coton': {
    hoverImage: 'WhatsApp Image 2026-09-05 at 13.58.07 (5).jpeg',
    gender: 'homme',
    category: 'homme',
    categoryLabel: 'Ensembles Tradi-Modernes',
    price: 40000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Bleu Roi Signature', hex: '#1F51FF' },
      { name: 'Gris Anthracite', hex: '#3D3D3D' },
      { name: 'Aubergine Foncé', hex: '#4A154B' },
      { name: 'Bleu Nuit', hex: '#1A2B4C' }
    ],
    material: '100% Coton premium et broderies de prestige',
    care: "Lavage doux à 30°C ou nettoyage à sec. Repassage sur l'envers.",
    description: "Ensemble 2 pièces signature Élégance by Michou (tunique mi-longue et pantalon droit) en coton haute qualité avec broderies stylisées sur la poche et le col. L'incontournable du vestiaire masculin élégant."
  }
};

/**
 * Heuristic generator for any newly added folder in the future
 */
function inferConfig(folderName, slug) {
  const lower = folderName.toLowerCase();
  
  // Material extraction
  let material = 'Coton et fibres nobles de qualité supérieure';
  if (/100%\s*coton/i.test(lower)) {
    material = '100% Coton de première qualité';
  } else if (/lin/i.test(lower)) {
    material = '100% Lin naturel respirant';
  } else if (/soie/i.test(lower)) {
    material = 'Soie pure et crêpe fluide';
  } else if (/bazin/i.test(lower)) {
    material = 'Bazin riche 100% coton teinté et brodé';
  } else if (/supercen/i.test(lower)) {
    material = 'Tissu Supercent résistant et raffiné';
  }

  // Gender detection
  let gender = 'femme';
  if (/homme|boubou|safari|costume/i.test(lower)) {
    gender = 'homme';
  }

  // Category detection
  let category = 'robes';
  let categoryLabel = 'Robes';
  if (/robe/i.test(lower)) {
    category = 'robes';
    categoryLabel = 'Robes';
  } else if (/jupe/i.test(lower)) {
    category = 'jupes';
    categoryLabel = 'Jupes';
  } else if (/pantalon/i.test(lower)) {
    category = 'pantalons';
    categoryLabel = 'Pantalons';
  } else if (/haut|blouse|chemise|top|polo/i.test(lower)) {
    category = gender === 'homme' ? 'homme' : 'hauts';
    categoryLabel = gender === 'homme' ? 'Chemises & Hauts' : 'Hauts & Blouses';
  } else if (/accessoire|sac|foulard|bijou/i.test(lower)) {
    category = 'accessoires';
    categoryLabel = 'Accessoires';
  } else if (gender === 'homme') {
    category = 'homme';
    categoryLabel = 'Mode Masculine';
  }

  return {
    gender,
    category,
    categoryLabel,
    price: 35000,
    sizes: gender === 'femme' ? ['XS', 'S', 'M', 'L', 'XL'] : ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Modèle Unique', hex: '#C8B89A' }
    ],
    material,
    care: 'Lavage délicat à 30°C ou nettoyage à sec.',
    description: `Superbe création « ${folderName} » issue de notre collection exclusive Élégance by Michou. Une pièce soignée, conçue dans des matières nobles pour un tombé remarquable.`
  };
}

function syncProducts() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.error('Products directory does not exist:', PRODUCTS_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true });
  const subdirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  console.log(`Found ${subdirs.length} product subdirectories in /public/images/products/\n`);

  const products = [];

  for (const folderName of subdirs) {
    const slug = generateSlug(folderName);
    const folderPath = path.join(PRODUCTS_DIR, folderName);
    
    // Read all image files in this folder
    const allFiles = fs.readdirSync(folderPath);
    const imageFiles = allFiles
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .sort(naturalSort);

    if (imageFiles.length === 0) {
      console.warn(`[WARNING] Subfolder "${folderName}" has no images. Skipping.`);
      continue;
    }

    // Configuration (known visual audit or fallback inference)
    const config = KNOWN_CONFIGS[slug] || inferConfig(folderName, slug);

    // If a primaryImage is specified, move it to index 0
    if (config.primaryImage && imageFiles.includes(config.primaryImage)) {
      imageFiles.splice(imageFiles.indexOf(config.primaryImage), 1);
      imageFiles.unshift(config.primaryImage);
    }

    // Relative web paths (URL-encoded to safely handle spaces, accents, and special characters like %)
    const images = imageFiles.map(img => `/images/products/${encodeURIComponent(folderName)}/${encodeURIComponent(img)}`);

    products.push({
      id: slug,
      slug: slug,
      name: folderName, // exact folder name as requested
      price: config.price,
      originalPrice: config.originalPrice,
      category: config.category,
      categoryLabel: config.categoryLabel,
      gender: config.gender,
      badge: 'Nouveau',
      sizes: config.sizes,
      colors: config.colors,
      images: images,
      ...(config.hoverImage ? { hoverImage: `/images/products/${encodeURIComponent(folderName)}/${encodeURIComponent(config.hoverImage)}` } : {}),
      description: config.description,
      material: config.material,
      care: config.care,
      relatedProducts: []
    });

    console.log(`+ [${slug}] "${folderName}" -> ${config.gender} | ${config.categoryLabel} | ${images.length} images`);
  }

  // Populate relatedProducts with other product slugs
  products.forEach(p => {
    p.relatedProducts = products
      .filter(other => other.id !== p.id)
      .map(other => other.id)
      .slice(0, 3);
  });

  // Generate data/products.ts content
  const tsContent = `import { Product } from '@/types';

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export const WHATSAPP_NUMBER = '221782644102';
export const FREE_SHIPPING_THRESHOLD = 50000;
export const SHIPPING_COST = 3500;
export const SENEGAL_CITIES = [
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Mbour',
  'Kaolack',
  'Ziguinchor',
  'Touba',
  'Rufisque',
  'Pikine',
  'Guédiawaye',
  'Diourbel',
  'Louga',
  'Tambacounda',
  'Kolda',
  'Fatick'
];
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
  console.log(`\nSuccessfully wrote ${products.length} products to data/products.ts`);
}

syncProducts();
