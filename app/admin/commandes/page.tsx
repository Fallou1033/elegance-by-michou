'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { AdminOrder, OrderStatus } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [updatingOrderNumber, setUpdatingOrderNumber] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderNumber: string, newStatus: OrderStatus) => {
    setUpdatingOrderNumber(orderNumber);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o.orderNumber === orderNumber ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error('Erreur mise à jour statut:', e);
    } finally {
      setUpdatingOrderNumber(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        !searchQuery.trim() ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      en_attente: orders.filter(o => o.status === 'en_attente').length,
      confirmee: orders.filter(o => o.status === 'confirmee').length,
      en_livraison: orders.filter(o => o.status === 'en_livraison').length,
      livree: orders.filter(o => o.status === 'livree').length,
      annulee: orders.filter(o => o.status === 'annulee').length,
    };
  }, [orders]);

  const generateWhatsAppLink = (order: AdminOrder) => {
    let greeting = `Bonjour ${order.customerName} ! 👋\nC'est la boutique Elegance By Michou. `;
    if (order.status === 'en_attente') {
      greeting += `Nous avons bien reçu votre commande *${order.orderNumber}* d'un montant de ${formatPrice(order.total)}.\nSouhaitez-vous confirmer l'expédition pour ${order.city} ?`;
    } else if (order.status === 'en_livraison') {
      greeting += `Excellente nouvelle ! Votre commande *${order.orderNumber}* est actuellement entre les mains de notre coursier pour livraison à votre adresse (${order.address}).`;
    } else if (order.status === 'livree') {
      greeting += `Nous vous remercions pour votre confiance ! Votre commande *${order.orderNumber}* a été livrée. Au plaisir de vous habiller à nouveau très bientôt. ✨`;
    } else {
      greeting += `Concernant votre commande *${order.orderNumber}* (${formatPrice(order.total)}), nous sommes à votre disposition pour toute question.`;
    }

    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
        <p className="text-xs text-stone font-medium">Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-anthracite">
          Suivi des Commandes Clients
        </h1>
        <p className="text-xs sm:text-sm text-stone mt-1">
          Visualisez les commandes en temps réel, changez leur statut et contactez directement vos clients par WhatsApp.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone/15 pb-3">
        {[
          { id: 'all', label: 'Toutes', count: counts.all },
          { id: 'en_attente', label: '⏳ En attente', count: counts.en_attente },
          { id: 'confirmee', label: '✓ Confirmées', count: counts.confirmee },
          { id: 'en_livraison', label: '🚚 En livraison', count: counts.en_livraison },
          { id: 'livree', label: '🎉 Livrées', count: counts.livree },
          { id: 'annulee', label: '✖ Annulées', count: counts.annulee },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedStatus === tab.id
                ? 'bg-anthracite text-white shadow-xs'
                : 'bg-white text-stone border border-stone/20 hover:text-anthracite'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-stone/10 text-stone'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-stone/15 shadow-xs flex items-center gap-2">
        <Search size={16} className="text-stone ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher par N° commande, nom client, numéro de téléphone, ville..."
          className="w-full py-1 text-xs outline-none text-anthracite placeholder:text-stone"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-stone hover:text-anthracite pr-2"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone/15">
          <ShoppingBag size={48} className="mx-auto text-stone/30 mb-3" />
          <p className="font-serif text-lg font-semibold text-anthracite">Aucune commande trouvée</p>
          <p className="text-xs text-stone mt-1">
            Aucune commande ne correspond à vos critères de recherche actuels.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.orderNumber}
              className="bg-white rounded-2xl border border-stone/15 shadow-xs p-5 hover:shadow-md transition-shadow space-y-4"
            >
              {/* Header Commande */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone/10 text-anthracite flex items-center justify-center font-serif font-bold text-sm shrink-0">
                    <ShoppingBag size={18} className="text-terracotta" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-anthracite">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-stone">
                        • {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="text-xs text-stone font-medium">
                      Paiement via{' '}
                      <span className="font-semibold text-anthracite uppercase">
                        {order.paymentMethod}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Statut & WhatsApp button */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select
                    value={order.status}
                    disabled={updatingOrderNumber === order.orderNumber}
                    onChange={e => handleStatusChange(order.orderNumber, e.target.value as OrderStatus)}
                    className="text-xs rounded-xl border border-stone/20 bg-[#FAF9F6] py-2 px-3 font-semibold text-anthracite focus:border-terracotta outline-none cursor-pointer"
                  >
                    <option value="en_attente">⏳ En attente</option>
                    <option value="confirmee">✓ Confirmée</option>
                    <option value="en_livraison">🚚 En livraison</option>
                    <option value="livree">🎉 Livrée</option>
                    <option value="annulee">✖ Annulée</option>
                  </select>

                  <a
                    href={generateWhatsAppLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Contenu : Client & Articles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Infos Client */}
                <div className="bg-[#FAF9F6] p-4 rounded-xl space-y-2 border border-stone/10">
                  <span className="font-semibold uppercase tracking-wider text-stone block text-[10px]">
                    Destinataire
                  </span>
                  <p className="font-bold text-sm text-anthracite">{order.customerName}</p>
                  <p className="flex items-center gap-1.5 text-stone">
                    <Phone size={13} className="text-terracotta" />
                    <a href={`tel:${order.phone}`} className="hover:underline font-mono">
                      {order.phone}
                    </a>
                  </p>
                  <p className="flex items-start gap-1.5 text-stone">
                    <MapPin size={13} className="text-terracotta shrink-0 mt-0.5" />
                    <span>{order.address}, <strong>{order.city}</strong></span>
                  </p>
                  {order.notes && (
                    <p className="flex items-start gap-1.5 text-stone/80 italic pt-1 border-t border-stone/10">
                      <FileText size={13} className="shrink-0 mt-0.5" />
                      <span>« {order.notes} »</span>
                    </p>
                  )}
                </div>

                {/* Articles Commandés (2 colonnes) */}
                <div className="md:col-span-2 space-y-2">
                  <span className="font-semibold uppercase tracking-wider text-stone block text-[10px]">
                    Articles ({order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1})
                  </span>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-stone/5 border border-stone/10"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-10 rounded bg-stone/10 shrink-0 overflow-hidden">
                            {item.product?.images?.[0] && (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-anthracite block">
                              {item.product?.name}
                            </span>
                            <span className="text-[11px] text-stone">
                              Taille : <strong>{item.selectedSize}</strong> • Couleur : <strong>{item.selectedColor}</strong> • Qté : <strong>{item.quantity}</strong>
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-anthracite">
                          {formatPrice((item.product?.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div className="flex justify-end gap-6 pt-2 border-t border-stone/10 text-xs">
                    <div>
                      <span className="text-stone">Sous-total : </span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div>
                      <span className="text-stone">Livraison : </span>
                      <span className="font-medium">
                        {order.shipping === 0 ? 'Gratuite' : formatPrice(order.shipping)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-anthracite">Total : </span>
                      <span className="font-serif font-bold text-terracotta text-base">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
