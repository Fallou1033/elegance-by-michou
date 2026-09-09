export interface ColorSample {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Nuancier haute couture adapté à la mode sénégalaise et internationale
const COLOR_PALETTE: Array<{ name: string; hex: string }> = [
  // Noirs et Gris
  { name: 'Noir Impérial', hex: '#000000' },
  { name: 'Noir Intense', hex: '#1A1A1A' },
  { name: 'Gris Anthracite', hex: '#333333' },
  { name: 'Gris Souris', hex: '#666666' },
  { name: 'Gris Cendré', hex: '#8C8C88' },
  { name: 'Gris Perle', hex: '#C0C0C0' },
  { name: 'Argent Métallisé', hex: '#DCDCDC' },

  // Blancs et Écrus
  { name: 'Blanc Pur', hex: '#FFFFFF' },
  { name: 'Blanc Nacré', hex: '#FAF9F6' },
  { name: 'Ivoire', hex: '#FFFFF0' },
  { name: 'Blanc Cassé', hex: '#FDFBF7' },
  { name: 'Écru', hex: '#F5F5DC' },
  { name: 'Crème', hex: '#FFFDD0' },

  // Beiges, Camels et Terres
  { name: 'Beige Sable', hex: '#C8B89A' },
  { name: 'Beige Doré', hex: '#D4B896' },
  { name: 'Camel Chic', hex: '#C19A6B' },
  { name: 'Marron Cuir', hex: '#8B4513' },
  { name: 'Chocolat Intense', hex: '#4B3621' },
  { name: 'Café', hex: '#5C4033' },
  { name: 'Terracotta', hex: '#C4704F' },
  { name: 'Caramel', hex: '#C67A42' },
  { name: 'Cannelle', hex: '#D2691E' },
  { name: 'Brique', hex: '#B23A22' },

  // Bleus
  { name: 'Bleu Nuit', hex: '#1A2B4C' },
  { name: 'Bleu Marine', hex: '#1F3A5F' },
  { name: 'Bleu Pétrole', hex: '#1B4965' },
  { name: 'Bleu Roi', hex: '#1F51FF' },
  { name: 'Bleu Majorelle', hex: '#2A52BE' },
  { name: 'Bleu Cobalt', hex: '#0047AB' },
  { name: 'Bleu Océan', hex: '#0077B6' },
  { name: 'Bleu Ciel', hex: '#87CEEB' },
  { name: 'Bleu Pastel', hex: '#AEC6CF' },
  { name: 'Turquoise Cérémonie', hex: '#00A896' },
  { name: 'Bleu Turquoise', hex: '#40E0D0' },
  { name: 'Bleu Paon', hex: '#005F73' },

  // Verts
  { name: 'Vert Émeraude', hex: '#124E3F' },
  { name: 'Vert Bouteille', hex: '#1E3F20' },
  { name: 'Vert Forêt', hex: '#2E8B57' },
  { name: 'Vert Sapin', hex: '#0B6623' },
  { name: 'Kaki Safari', hex: '#4B5320' },
  { name: 'Kaki Olive', hex: '#7D7C4F' },
  { name: 'Vert Olive', hex: '#556B2F' },
  { name: 'Vert Sauge', hex: '#9CAF88' },
  { name: 'Vert Amande', hex: '#A8E4A0' },
  { name: 'Vert Menthe', hex: '#98FF98' },
  { name: 'Vert Pistache', hex: '#BEF574' },

  // Rouges et Bordeaux
  { name: 'Bordeaux Majestueux', hex: '#6B1D2F' },
  { name: 'Bordeaux Lie de Vin', hex: '#722F37' },
  { name: 'Grenat', hex: '#7D0541' },
  { name: 'Rouge Carmin', hex: '#B91C1C' },
  { name: 'Rouge Passion', hex: '#DC2626' },
  { name: 'Rouge Vif', hex: '#FF0000' },
  { name: 'Rouge Brique', hex: '#A93226' },

  // Roses et Violets
  { name: 'Aubergine Foncé', hex: '#4A154B' },
  { name: 'Pourpre Royal', hex: '#5A189A' },
  { name: 'Violet Cérémonie', hex: '#7B2CBF' },
  { name: 'Prune', hex: '#701C45' },
  { name: 'Mauve', hex: '#9B59B6' },
  { name: 'Lilas', hex: '#C8A2C8' },
  { name: 'Rose Framboise', hex: '#E1306C' },
  { name: 'Fuchsia', hex: '#FF007F' },
  { name: 'Rose Poudré', hex: '#E8B4B8' },
  { name: 'Vieux Rose', hex: '#C08081' },
  { name: 'Rose Bonbon', hex: '#FF69B4' },

  // Or, Bronze et Jaunes
  { name: 'Or & Bronze', hex: '#C5A059' },
  { name: 'Doré Royal', hex: '#D4AF37' },
  { name: 'Or Pur', hex: '#FFD700' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Cuivre', hex: '#B87333' },
  { name: 'Jaune Moutarde', hex: '#E1AD01' },
  { name: 'Jaune Ocre', hex: '#CC7722' },
  { name: 'Jaune Safran', hex: '#F4C430' },
  { name: 'Jaune Soleil', hex: '#FFD300' },
  { name: 'Orange Sanguine', hex: '#FF4500' },
  { name: 'Orange Mandarine', hex: '#FFA500' },
  { name: 'Pêche Dorée', hex: '#FFCBA4' },
];

const PREPROCESSED_PALETTE: ColorSample[] = COLOR_PALETTE.map(item => {
  const rgb = hexToRgb(item.hex);
  return { ...item, ...rgb };
});

// Calcul de distance pondérée (Redmean color distance) pour reproduire la perception de l'œil humain
function getPerceptualDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const deltaR = r1 - r2;
  const deltaG = g1 - g2;
  const deltaB = b1 - b2;
  return Math.sqrt(
    (((512 + rmean) * deltaR * deltaR) >> 8) +
      4 * deltaG * deltaG +
      (((767 - rmean) * deltaB * deltaB) >> 8)
  );
}

/**
 * Détecte automatiquement le nom français le plus proche pour n'importe quel code hexadécimal
 */
export function detectColorName(hex: string): string {
  try {
    const { r, g, b } = hexToRgb(hex);
    let minDistance = Infinity;
    let closestName = 'Personnalisé';

    for (const sample of PREPROCESSED_PALETTE) {
      const dist = getPerceptualDistance(r, g, b, sample.r, sample.g, sample.b);
      if (dist < minDistance) {
        minDistance = dist;
        closestName = sample.name;
      }
    }

    return closestName;
  } catch {
    return 'Couleur';
  }
}

// Couleurs rapides en un clic pour les ateliers de mode
export const POPULAR_COLOR_PRESETS = [
  { name: 'Noir Impérial', hex: '#1A1A1A' },
  { name: 'Blanc Nacré', hex: '#FAF9F6' },
  { name: 'Terracotta', hex: '#C4704F' },
  { name: 'Bleu Roi', hex: '#1F51FF' },
  { name: 'Bleu Marine', hex: '#1F3A5F' },
  { name: 'Bleu Ciel', hex: '#87CEEB' },
  { name: 'Beige Sable', hex: '#C8B89A' },
  { name: 'Kaki Safari', hex: '#4B5320' },
  { name: 'Bordeaux Majestueux', hex: '#6B1D2F' },
  { name: 'Vert Émeraude', hex: '#124E3F' },
  { name: 'Or & Bronze', hex: '#C5A059' },
  { name: 'Gris Anthracite', hex: '#333333' },
];
