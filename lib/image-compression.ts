/**
 * Utilitaire d'optimisation et de compression d'images côté client
 * Transforme les photos volumineuses (téléphone, appareil photo) en images légères
 * et nettes prêtes pour le web et l'affichage mobile/desktop rapide.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné n’est pas une image valide.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcul du redimensionnement proportionnel
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback direct sur l'original si canvas non disponible
          resolve(img.src);
          return;
        }

        // Anti-aliasing et lissage haute qualité
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dessin de l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Exportation en JPEG optimisé
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error('Impossible de lire l’image sélectionnée.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier.'));
    };

    reader.readAsDataURL(file);
  });
}
