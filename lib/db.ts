import fs from 'fs';
import path from 'path';
import { Product, CartItem } from '@/types';
import { products as initialProducts } from '@/data/products';

export type OrderStatus = 'en_attente' | 'confirmee' | 'en_livraison' | 'livree' | 'annulee';

export interface AdminOrder {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: 'wave' | 'orange-money' | 'cash';
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_OVERRIDE_FILE = path.join(DATA_DIR, 'products-override.json');

// Commandes de départ pour initialiser le tableau de bord avec de réelles métriques
const INITIAL_ORDERS: AdminOrder[] = [
  {
    orderNumber: 'CMD-2026-84920',
    customerName: 'Aissatou Diallo',
    phone: '+221 77 452 89 12',
    address: 'Almadies, Villa 42 en face King Fahd',
    city: 'Dakar',
    notes: 'Livrer de préférence en début d’après-midi svp',
    paymentMethod: 'wave',
    status: 'livree',
    items: [
      {
        product: initialProducts[0] || { id: 'costume-africain', name: 'Costume africain', price: 50000 },
        selectedSize: 'L',
        selectedColor: 'Noir Impérial',
        quantity: 1,
        cartItemId: 'costume-africain-L-Noir',
      },
    ],
    subtotal: 50000,
    shipping: 0,
    total: 50000,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    orderNumber: 'CMD-2026-73194',
    customerName: 'Cheikh Tidiane Ndiaye',
    phone: '+221 78 120 54 88',
    address: 'Mermoz Pyrotechnie, près de la Brioche Dorée',
    city: 'Dakar',
    notes: 'Appeler 15 minutes avant d’arriver',
    paymentMethod: 'orange-money',
    status: 'en_livraison',
    items: [
      {
        product: initialProducts[1] || { id: 'ensemble-lin-homme', name: 'Ensemble lin homme', price: 20000 },
        selectedSize: 'XL',
        selectedColor: 'Bleu Ciel',
        quantity: 2,
        cartItemId: 'ensemble-lin-homme-XL-Bleu',
      },
    ],
    subtotal: 40000,
    shipping: 3500,
    total: 43500,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    orderNumber: 'CMD-2026-92015',
    customerName: 'Marieme Ba',
    phone: '+221 76 893 21 00',
    address: 'Quartier Cité Lamy',
    city: 'Thiès',
    notes: 'Commande urgente pour le week-end',
    paymentMethod: 'wave',
    status: 'confirmee',
    items: [
      {
        product: initialProducts[3] || { id: 'mini-robe-brode-anglais', name: 'Mini robe brodé anglais', price: 13000 },
        selectedSize: 'M',
        selectedColor: 'Blanc Broderie',
        quantity: 1,
        cartItemId: 'mini-robe-M-Blanc',
      },
    ],
    subtotal: 13000,
    shipping: 3500,
    total: 16500,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
  {
    orderNumber: 'CMD-2026-95431',
    customerName: 'Ousmane Noel Dieng',
    phone: '+221 77 612 34 56',
    address: 'Saly Portudal, Résidence Palmeraie',
    city: 'Mbour',
    notes: 'Paiement Wave validé',
    paymentMethod: 'wave',
    status: 'en_attente',
    items: [
      {
        product: initialProducts[2] || { id: 'grand-boubou', name: 'Grand boubou', price: 170000 },
        selectedSize: 'XL',
        selectedColor: "Blanc d'Apparat",
        quantity: 1,
        cartItemId: 'grand-boubou-XL-Blanc',
      },
    ],
    subtotal: 170000,
    shipping: 0,
    total: 170000,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

// Cache mémoire pour garantir la réactivité même si le système de fichiers est restreint
let memoryOrders: AdminOrder[] = [...INITIAL_ORDERS];
let memoryProducts: Product[] = [...initialProducts];
let isLoaded = false;

function ensureDataLoaded() {
  if (isLoaded) return;
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryOrders = parsed;
      }
    }
  } catch (e) {
    console.warn('Orders file read warning:', e);
  }

  try {
    if (fs.existsSync(PRODUCTS_OVERRIDE_FILE)) {
      const data = fs.readFileSync(PRODUCTS_OVERRIDE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProducts = parsed;
      }
    }
  } catch (e) {
    console.warn('Products file read warning:', e);
  }

  isLoaded = true;
}

function persistOrders() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Persist orders warning (may be serverless readonly):', e);
  }
}

function persistProducts() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_OVERRIDE_FILE, JSON.stringify(memoryProducts, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Persist products warning (may be serverless readonly):', e);
  }
}

// ==================== PRODUITS ====================

export function getDbProducts(): Product[] {
  ensureDataLoaded();
  return memoryProducts;
}

export function getDbProductById(id: string): Product | undefined {
  ensureDataLoaded();
  return memoryProducts.find(p => p.id === id || p.slug === id);
}

export function saveDbProduct(productData: Partial<Product> & { name: string; price: number }): Product {
  ensureDataLoaded();
  
  const id = productData.id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const existingIndex = memoryProducts.findIndex(p => p.id === id || p.slug === id);

  const fullProduct: Product = {
    id,
    slug: id,
    name: productData.name,
    price: Number(productData.price),
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
    category: productData.category || 'robes',
    categoryLabel: productData.categoryLabel || productData.category,
    gender: productData.gender || 'femme',
    description: productData.description || '',
    material: productData.material || '100% Coton',
    care: productData.care || 'Lavage délicat à 30°C.',
    sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL'],
    colors: Array.isArray(productData.colors) && productData.colors.length > 0 ? productData.colors : [{ name: 'Standard', hex: '#C4704F' }],
    images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ['/images/placeholder.jpg'],
    hoverImage: productData.hoverImage,
    badge: productData.badge,
    discount: productData.discount,
    relatedProducts: productData.relatedProducts || [],
  };

  if (existingIndex >= 0) {
    memoryProducts[existingIndex] = { ...memoryProducts[existingIndex], ...fullProduct };
  } else {
    memoryProducts.unshift(fullProduct);
  }

  persistProducts();
  return fullProduct;
}

export function deleteDbProduct(id: string): boolean {
  ensureDataLoaded();
  const initialLength = memoryProducts.length;
  memoryProducts = memoryProducts.filter(p => p.id !== id && p.slug !== id);
  if (memoryProducts.length < initialLength) {
    persistProducts();
    return true;
  }
  return false;
}

// ==================== COMMANDES ====================

export function getDbOrders(): AdminOrder[] {
  ensureDataLoaded();
  return memoryOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDbOrderById(orderNumber: string): AdminOrder | undefined {
  ensureDataLoaded();
  return memoryOrders.find(o => o.orderNumber === orderNumber);
}

export function createDbOrder(orderData: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: 'wave' | 'orange-money' | 'cash';
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}): AdminOrder {
  ensureDataLoaded();

  const newOrder: AdminOrder = {
    orderNumber: orderData.orderNumber,
    customerName: orderData.customerName,
    phone: orderData.phone,
    address: orderData.address,
    city: orderData.city,
    notes: orderData.notes,
    paymentMethod: orderData.paymentMethod,
    status: 'en_attente',
    items: orderData.items,
    subtotal: Number(orderData.subtotal),
    shipping: Number(orderData.shipping),
    total: Number(orderData.total),
    createdAt: new Date().toISOString(),
  };

  memoryOrders.unshift(newOrder);
  persistOrders();
  return newOrder;
}

export function updateDbOrderStatus(orderNumber: string, status: OrderStatus): AdminOrder | null {
  ensureDataLoaded();
  const order = memoryOrders.find(o => o.orderNumber === orderNumber);
  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();
  persistOrders();
  return order;
}

// ==================== STATISTIQUES FINANCIÈRES ====================

export function getFinancialAnalytics() {
  ensureDataLoaded();
  const orders = memoryOrders;

  // Calcul des montants
  let totalRevenue = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;
  let pendingRevenue = 0;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const paymentBreakdown: Record<string, { count: number; amount: number }> = {
    wave: { count: 0, amount: 0 },
    'orange-money': { count: 0, amount: 0 },
    cash: { count: 0, amount: 0 },
  };

  const cityBreakdown: Record<string, { count: number; amount: number }> = {};
  const statusCounts: Record<OrderStatus, number> = {
    en_attente: 0,
    confirmee: 0,
    en_livraison: 0,
    livree: 0,
    annulee: 0,
  };

  const productSalesMap: Record<string, { name: string; quantity: number; totalRevenue: number }> = {};

  orders.forEach(order => {
    const isRevenueValid = order.status !== 'annulee';
    const orderDateStr = order.createdAt.split('T')[0];
    const orderYearMonth = order.createdAt.substring(0, 7);

    // Comptage des statuts
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status]++;
    }

    if (order.status === 'en_attente') {
      pendingRevenue += order.total;
    }

    if (isRevenueValid) {
      totalRevenue += order.total;

      if (orderDateStr === todayStr) {
        todayRevenue += order.total;
      }
      if (orderYearMonth === currentYearMonth) {
        monthRevenue += order.total;
      }

      // Par mode de paiement
      const method = order.paymentMethod || 'wave';
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { count: 0, amount: 0 };
      }
      paymentBreakdown[method].count++;
      paymentBreakdown[method].amount += order.total;

      // Par ville
      const city = order.city || 'Non spécifiée';
      if (!cityBreakdown[city]) {
        cityBreakdown[city] = { count: 0, amount: 0 };
      }
      cityBreakdown[city].count++;
      cityBreakdown[city].amount += order.total;

      // Ventes par produit
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const pId = item.product?.id || 'inconnu';
          const pName = item.product?.name || 'Produit';
          if (!productSalesMap[pId]) {
            productSalesMap[pId] = { name: pName, quantity: 0, totalRevenue: 0 };
          }
          productSalesMap[pId].quantity += item.quantity || 1;
          productSalesMap[pId].totalRevenue += (item.product?.price || 0) * (item.quantity || 1);
        });
      }
    }
  });

  const validOrdersCount = orders.filter(o => o.status !== 'annulee').length;
  const averageOrderValue = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0;

  const topProducts = Object.entries(productSalesMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const topCities = Object.entries(cityBreakdown)
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalRevenue,
    todayRevenue,
    monthRevenue,
    pendingRevenue,
    totalOrders: orders.length,
    validOrdersCount,
    averageOrderValue,
    statusCounts,
    paymentBreakdown,
    topCities,
    topProducts,
    recentOrders: orders.slice(0, 5),
  };
}
