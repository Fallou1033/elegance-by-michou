'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  PackageCheck,
  CreditCard,
  Building,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AdminOrder } from '@/lib/db';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
      console.error('Erreur chargement statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateStatus = async (orderNumber: string, newStatus: string) => {
    setUpdatingOrderId(orderNumber);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, status: newStatus }),
      });
      if (res.ok) {
        await fetchStats();
      }
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock size={12} /> En attente
          </span>
        );
      case 'confirmee':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle2 size={12} /> Confirmée
          </span>
        );
      case 'en_livraison':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <PackageCheck size={12} /> En livraison
          </span>
        );
      case 'livree':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} /> Livrée
          </span>
        );
      case 'annulee':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const generateWhatsAppMessage = (order: AdminOrder) => {
    const text = `Bonjour ${order.customerName} ! 👋\nC'est la boutique Elegance By Michou concernant votre commande *${order.orderNumber}* (${formatPrice(order.total)}).\nNous préparons vos articles pour la livraison à ${order.city}. Êtes-vous disponible aujourd'hui ?`;
    return `https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        <p className="text-xs text-stone font-medium">Chargement des données de la boutique...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-anthracite">
            Tableau de Bord & Finances
          </h1>
          <p className="text-xs sm:text-sm text-stone mt-1">
            Aperçu en temps réel de votre activité commerciale et financière.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produits/nouveau"
            className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
          >
            <PlusCircle size={16} />
            Ajouter un produit
          </Link>
          <Link
            href="/admin/finances"
            className="inline-flex items-center gap-2 bg-white hover:bg-stone/5 border border-stone/20 text-anthracite px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <TrendingUp size={16} className="text-terracotta" />
            Bilan Financier
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Chiffre d&apos;Affaires</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-anthracite">
            {formatPrice(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <span>+{formatPrice(stats.monthRevenue)}</span>
            <span className="text-stone">ce mois-ci</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Commandes Totales</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-anthracite">
            {stats.totalOrders}
          </div>
          <p className="text-[11px] text-stone mt-2">
            {stats.statusCounts.livree} livrées avec succès
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Commandes en attente</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-amber-600">
            {stats.statusCounts.en_attente}
          </div>
          <p className="text-[11px] text-stone mt-2">
            {formatPrice(stats.pendingRevenue)} en attente d&apos;encaissement
          </p>
        </div>

        {/* Average Cart */}
        <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Panier Moyen</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-anthracite">
            {formatPrice(stats.averageOrderValue)}
          </div>
          <p className="text-[11px] text-stone mt-2">Par client sur la boutique</p>
        </div>
      </div>

      {/* Grid: Commandes Récentes + Synthèse Répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Commandes Récentes (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone/15 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone/10 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-anthracite">
                Commandes Récentes
              </h2>
              <p className="text-xs text-stone">Dernières commandes enregistrées sur le site</p>
            </div>
            <Link
              href="/admin/commandes"
              className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
            >
              Voir tout ({stats.totalOrders}) <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-stone uppercase tracking-wider font-semibold border-b border-stone/10">
                <tr>
                  <th className="py-3 px-4">Commande</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone">
                      <ShoppingBag size={32} className="mx-auto text-stone/30 mb-2" />
                      <p className="font-medium text-anthracite text-xs sm:text-sm">
                        Aucune commande enregistrée pour le moment
                      </p>
                      <p className="text-[11px] text-stone mt-0.5">
                        Les commandes passées par vos clients apparaîtront ici automatiquement en direct.
                      </p>
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order: AdminOrder) => (
                    <tr key={order.orderNumber} className="hover:bg-stone/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-anthracite">
                        {order.orderNumber}
                        <span className="block text-[10px] text-stone font-sans">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-anthracite block">{order.customerName}</span>
                        <span className="text-[11px] text-stone">{order.city} · {order.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-anthracite">
                        {formatPrice(order.total)}
                        <span className="block text-[10px] text-stone uppercase">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.orderNumber}
                          onChange={e => handleUpdateStatus(order.orderNumber, e.target.value)}
                          className="text-xs rounded-lg border border-stone/20 bg-white py-1 px-2 font-medium focus:outline-none focus:border-terracotta cursor-pointer"
                        >
                          <option value="en_attente">⏳ En attente</option>
                          <option value="confirmee">✓ Confirmée</option>
                          <option value="en_livraison">🚚 En livraison</option>
                          <option value="livree">🎉 Livrée</option>
                          <option value="annulee">✖ Annulée</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={generateWhatsAppMessage(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                          title="Contacter sur WhatsApp"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Synthèse Répartition & Top Produits (1 col) */}
        <div className="space-y-6">
          {/* Modes de Paiement */}
          <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs">
            <h3 className="font-serif text-base font-semibold text-anthracite mb-4">
              Modes de Paiement
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#1DA1F2] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1DA1F2]" /> Wave
                  </span>
                  <span className="font-semibold text-anthracite">
                    {formatPrice(stats.paymentBreakdown.wave?.amount || 0)}
                  </span>
                </div>
                <div className="w-full bg-stone/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1DA1F2] h-full rounded-full"
                    style={{
                      width: `${
                        stats.totalRevenue > 0
                          ? Math.round(((stats.paymentBreakdown.wave?.amount || 0) / stats.totalRevenue) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#FF7900] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" /> Orange Money
                  </span>
                  <span className="font-semibold text-anthracite">
                    {formatPrice(stats.paymentBreakdown['orange-money']?.amount || 0)}
                  </span>
                </div>
                <div className="w-full bg-stone/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF7900] h-full rounded-full"
                    style={{
                      width: `${
                        stats.totalRevenue > 0
                          ? Math.round(
                              ((stats.paymentBreakdown['orange-money']?.amount || 0) / stats.totalRevenue) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Ventes Produits */}
          <div className="bg-white rounded-2xl p-5 border border-stone/15 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-base font-semibold text-anthracite">
                Articles les plus vendus
              </h3>
              <Link href="/admin/produits" className="text-[11px] text-terracotta font-semibold hover:underline">
                Gérer
              </Link>
            </div>
            <div className="space-y-3">
              {stats.topProducts.length === 0 ? (
                <div className="py-6 text-center text-stone text-xs">
                  <p>Aucune vente enregistrée pour l&apos;instant</p>
                </div>
              ) : (
                stats.topProducts.map((p: any, idx: number) => (
                  <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-stone/10 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone/10 text-anthracite text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-anthracite truncate max-w-[140px]">
                        {p.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold block">{formatPrice(p.totalRevenue)}</span>
                      <span className="text-[10px] text-stone">{p.quantity} vendus</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
