'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Database,
  Cloud,
  Server,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function AdminDatabasePage() {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<{ isCloud: boolean; type: string }>({
    isCloud: false,
    type: 'Chargement...',
  });
  const [stats, setStats] = useState<{ totalProducts: number; totalOrders: number }>({
    totalProducts: 0,
    totalOrders: 0,
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/database');
      if (res.ok) {
        const data = await res.json();
        setConnection(data.connection);
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Erreur statut DB:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/database?action=export');
      if (!res.ok) throw new Error('Erreur lors de l’exportation.');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data.backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `sauvegarde-elegance-michou-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        text: 'Sauvegarde complète téléchargée avec succès sur votre appareil !',
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: err?.message || 'Erreur lors du téléchargement de la sauvegarde.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setMessage(null);

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData || (!backupData.products && !backupData.orders)) {
        throw new Error('Fichier de sauvegarde invalide ou corrompu.');
      }

      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backup: backupData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la restauration.');

      setMessage({ text: data.message, type: 'success' });
      await fetchStatus();
    } catch (err: any) {
      setMessage({
        text: err?.message || 'Erreur lors de la lecture du fichier de sauvegarde.',
        type: 'error',
      });
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-anthracite">
            Sauvegarde & Base de Données
          </h1>
          <p className="text-stone text-sm mt-1">
            Garantissez la persistance de vos articles, commandes et paramètres.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone/20 rounded-xl text-sm font-medium text-stone hover:text-anthracite hover:bg-stone/5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Message feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Connection status card */}
      <div className="bg-white rounded-2xl p-6 border border-stone/20 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                connection.isCloud ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-anthracite">
                État du Stockage des Données
              </h2>
              <p className="text-xs text-stone mt-0.5">Mode : {connection.type}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
              connection.isCloud
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connection.isCloud ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {connection.isCloud ? 'Connecté au Cloud (Éternel)' : 'Mode Serveur Standard'}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone/10">
          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-stone/10">
            <p className="text-xs font-medium text-stone uppercase tracking-wider">
              Articles dans le catalogue
            </p>
            <p className="text-2xl font-serif font-bold text-anthracite mt-1">
              {stats.totalProducts}
            </p>
          </div>
          <div className="bg-[#FAF9F6] p-4 rounded-xl border border-stone/10">
            <p className="text-xs font-medium text-stone uppercase tracking-wider">
              Commandes enregistrées
            </p>
            <p className="text-2xl font-serif font-bold text-anthracite mt-1">
              {stats.totalOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Backup and Restore Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone/20 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600">
              <Download size={22} />
            </div>
            <h3 className="text-base font-semibold text-anthracite">
              Sauvegarder mes données
            </h3>
            <p className="text-xs text-stone leading-relaxed">
              Téléchargez une copie complète et sécurisée (format JSON) contenant tous vos articles,
              photos, prix, descriptions et commandes. À conserver précieusement sur votre ordinateur
              ou téléphone.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={isExporting}
            className="mt-6 w-full py-3 px-4 bg-anthracite text-white rounded-xl text-sm font-medium hover:bg-terracotta transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            {isExporting ? 'Préparation...' : 'Télécharger la sauvegarde (.json)'}
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone/20 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600">
              <Upload size={22} />
            </div>
            <h3 className="text-base font-semibold text-anthracite">
              Restaurer une sauvegarde
            </h3>
            <p className="text-xs text-stone leading-relaxed">
              Réimportez un fichier de sauvegarde précédemment téléchargé. Vos articles et commandes
              seront instantanément réinjectés dans votre boutique en ligne.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="mt-6 w-full py-3 px-4 bg-white border border-stone/30 text-anthracite rounded-xl text-sm font-medium hover:bg-stone/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload size={16} />
              {isRestoring ? 'Restauration...' : 'Choisir un fichier de sauvegarde'}
            </button>
          </div>
        </div>
      </div>

      {/* Step by step guide to activate Vercel KV */}
      {!connection.isCloud && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
            <ShieldCheck size={20} className="text-amber-700" />
            <span>Comment activer la base de données Cloud permanente en 2 minutes ?</span>
          </div>

          <p className="text-xs text-amber-900/80 leading-relaxed">
            Pour que tous les articles que vous ajoutez depuis votre téléphone soient sauvegardés
            définitivement sans dépendre des redémarrages de serveur Vercel, activez **Vercel KV** (100% gratuit) :
          </p>

          <ol className="space-y-2 text-xs text-amber-950 font-medium list-decimal list-inside bg-white/80 p-4 rounded-xl border border-amber-200/50">
            <li>
              Ouvrez votre compte sur{' '}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta underline font-bold inline-flex items-center gap-1"
              >
                Vercel Dashboard <ExternalLink size={12} />
              </a>
            </li>
            <li>Allez dans votre projet <strong>elegance-by-michou</strong> puis cliquez sur l'onglet <strong>Storage</strong> tout en haut.</li>
            <li>Cliquez sur <strong>Create Database</strong> et choisissez <strong>KV</strong> (Propulsé par Upstash).</li>
            <li>Cliquez sur <strong>Connect to Project</strong>.</li>
          </ol>

          <div className="flex items-center gap-2 text-xs text-amber-800">
            <Info size={14} className="shrink-0" />
            <span>
              C&apos;est tout ! Vercel injectera automatiquement les clés sécurisées et vos données ne disparaîtront plus jamais.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
