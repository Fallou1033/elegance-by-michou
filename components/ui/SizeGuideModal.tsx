'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-anthracite/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-ivory w-full md:max-w-2xl md:rounded max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone/20 sticky top-0 bg-ivory">
          <h2 className="font-serif text-xl font-semibold">Guide des tailles</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone/10 rounded-full transition-colors" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone mb-4">Femme</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-anthracite text-ivory">
                  <th className="px-4 py-2 text-left font-medium">Taille</th>
                  <th className="px-4 py-2 text-center font-medium">Poitrine (cm)</th>
                  <th className="px-4 py-2 text-center font-medium">Taille (cm)</th>
                  <th className="px-4 py-2 text-center font-medium">Hanches (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['XS', '80-83', '60-63', '86-89'],
                  ['S', '84-87', '64-67', '90-93'],
                  ['M', '88-91', '68-71', '94-97'],
                  ['L', '92-95', '72-75', '98-101'],
                  ['XL', '96-99', '76-79', '102-105'],
                  ['XXL', '100-104', '80-84', '106-110'],
                ].map(([size, ...measures], i) => (
                  <tr key={size} className={i % 2 === 0 ? 'bg-stone/5' : 'bg-white'}>
                    <td className="px-4 py-2.5 font-semibold text-terracotta">{size}</td>
                    {measures.map((m, j) => (
                      <td key={j} className="px-4 py-2.5 text-center text-stone">{m}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone mb-4 mt-8">Homme</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-anthracite text-ivory">
                  <th className="px-4 py-2 text-left font-medium">Taille</th>
                  <th className="px-4 py-2 text-center font-medium">Poitrine (cm)</th>
                  <th className="px-4 py-2 text-center font-medium">Tour de taille (cm)</th>
                  <th className="px-4 py-2 text-center font-medium">Épaules (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['S', '88-92', '76-80', '42-43'],
                  ['M', '93-97', '81-85', '44-45'],
                  ['L', '98-102', '86-90', '46-47'],
                  ['XL', '103-107', '91-95', '48-49'],
                  ['XXL', '108-113', '96-101', '50-52'],
                ].map(([size, ...measures], i) => (
                  <tr key={size} className={i % 2 === 0 ? 'bg-stone/5' : 'bg-white'}>
                    <td className="px-4 py-2.5 font-semibold text-terracotta">{size}</td>
                    {measures.map((m, j) => (
                      <td key={j} className="px-4 py-2.5 text-center text-stone">{m}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-terracotta/10 rounded">
            <p className="text-xs text-stone leading-relaxed">
              <strong className="text-anthracite">Conseil :</strong> En cas de doute entre deux tailles, nous recommandons de prendre la taille supérieure. Pour toute question, contactez-nous via WhatsApp au +221 78 264 41 02.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
