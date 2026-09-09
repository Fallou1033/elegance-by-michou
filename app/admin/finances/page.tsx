'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  CreditCard,
  Building,
  DollarSign,
  PieChart,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminFinancesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Erreur stats finances:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        <p className="text-xs text-stone font-medium">Calcul du bilan financier...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-anthracite">
          Finances et Bilan de la Boutique
        </h1>
        <p className="text-xs sm:text-sm text-stone mt-1">
          Suivez la rentabilité de votre marque, les flux d&apos;encaissements Wave et Orange Money, ainsi que les ventes régionales.
        </p>
      </div>

      {/* KPI Financiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone block mb-1">
            Chiffre d&apos;Affaires Encaissé
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-anthracite">
            {formatPrice(stats.totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-2 inline-flex items-center gap-1">
            <ArrowUpRight size={13} /> {stats.validOrdersCount} commandes payées
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone block mb-1">
            Revenus du Mois en Cours
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-terracotta">
            {formatPrice(stats.monthRevenue)}
          </div>
          <span className="text-[11px] text-stone mt-2 block">
            Mois de {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone block mb-1">
            En Attente de Règlement
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-amber-600">
            {formatPrice(stats.pendingRevenue)}
          </div>
          <span className="text-[11px] text-stone mt-2 block">
            {stats.statusCounts.en_attente} commande(s) à confirmer
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone block mb-1">
            Panier Moyen par Client
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-anthracite">
            {formatPrice(stats.averageOrderValue)}
          </div>
          <span className="text-[11px] text-stone mt-2 block">
            Montant moyen dépensé
          </span>
        </div>
      </div>

      {/* Détail des Canaux de Paiement & Répartition Régionale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canaux de Paiement */}
        <div className="bg-white rounded-2xl p-6 border border-stone/15 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone/10 pb-3">
            <h2 className="font-serif text-lg font-semibold text-anthracite flex items-center gap-2">
              <CreditCard size={18} className="text-terracotta" />
              Canaux de Paiement
            </h2>
            <span className="text-xs text-stone font-medium">Répartition des flux</span>
          </div>

          <div className="space-y-5">
            {/* Wave */}
            <div className="p-4 rounded-xl bg-[#1DA1F2]/5 border border-[#1DA1F2]/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1DA1F2]" />
                  <span className="font-bold text-sm text-anthracite">Wave Sénégal</span>
                </div>
                <span className="font-bold text-base text-anthracite">
                  {formatPrice(stats.paymentBreakdown.wave?.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-stone">
                <span>{stats.paymentBreakdown.wave?.count || 0} transaction(s)</span>
                <span className="font-semibold">
                  {stats.totalRevenue > 0
                    ? Math.round(((stats.paymentBreakdown.wave?.amount || 0) / stats.totalRevenue) * 100)
                    : 0}
                  % des ventes
                </span>
              </div>
            </div>

            {/* Orange Money */}
            <div className="p-4 rounded-xl bg-[#FF7900]/5 border border-[#FF7900]/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF7900]" />
                  <span className="font-bold text-sm text-anthracite">Orange Money</span>
                </div>
                <span className="font-bold text-base text-anthracite">
                  {formatPrice(stats.paymentBreakdown['orange-money']?.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-stone">
                <span>{stats.paymentBreakdown['orange-money']?.count || 0} transaction(s)</span>
                <span className="font-semibold">
                  {stats.totalRevenue > 0
                    ? Math.round(
                        ((stats.paymentBreakdown['orange-money']?.amount || 0) / stats.totalRevenue) * 100
                      )
                    : 0}
                  % des ventes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition par Ville */}
        <div className="bg-white rounded-2xl p-6 border border-stone/15 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone/10 pb-3">
            <h2 className="font-serif text-lg font-semibold text-anthracite flex items-center gap-2">
              <Building size={18} className="text-terracotta" />
              Ventes par Ville
            </h2>
            <span className="text-xs text-stone font-medium">Zones de livraison</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {stats.topCities.length === 0 ? (
              <p className="text-xs text-stone py-6 text-center">
                Aucune vente par ville pour le moment
              </p>
            ) : (
              stats.topCities.map((city: any) => {
                const percentage =
                  stats.totalRevenue > 0 ? Math.round((city.amount / stats.totalRevenue) * 100) : 0;
                return (
                  <div key={city.city} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-anthracite">{city.city}</span>
                      <span className="font-bold text-anthracite">{formatPrice(city.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-stone/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-terracotta h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-stone w-8 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Produits Rentables */}
      <div className="bg-white rounded-2xl p-6 border border-stone/15 shadow-xs">
        <h2 className="font-serif text-lg font-semibold text-anthracite mb-4">
          Articles Générateurs de Revenus
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-stone uppercase tracking-wider font-semibold border-b border-stone/10">
              <tr>
                <th className="py-3 px-4">Rang</th>
                <th className="py-3 px-4">Nom de l&apos;Article</th>
                <th className="py-3 px-4">Quantité Vendue</th>
                <th className="py-3 px-4 text-right">Chiffre d&apos;Affaires Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {stats.topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-stone">
                    Aucune vente enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                stats.topProducts.map((p: any, idx: number) => (
                  <tr key={p.id} className="hover:bg-stone/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-anthracite">#{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-anthracite">{p.name}</td>
                    <td className="py-3.5 px-4 text-stone">{p.quantity} pièce(s)</td>
                    <td className="py-3.5 px-4 text-right font-bold text-anthracite text-sm">
                      {formatPrice(p.totalRevenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
