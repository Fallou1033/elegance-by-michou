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

const TMP_DIR = path.join('/tmp', 'elegance-michou');
const TMP_ORDERS_FILE = path.join(TMP_DIR, 'orders.json');
const TMP_PRODUCTS_FILE = path.join(TMP_DIR, 'products-override.json');

// Cache mémoire
const INITIAL_ORDERS: AdminOrder[] = [];
let memoryOrders: AdminOrder[] = [...INITIAL_ORDERS];
let memoryProducts: Product[] = [...initialProducts];
let isLoaded = false;

// ==================== CLOUD DATABASE (VERCEL KV / UPSTASH REDIS) ====================

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/+$/, ''), token };
  }
  return null;
}

export function getDbConnectionStatus(): { isCloud: boolean; type: string } {
  if (process.env.KV_REST_API_URL) return { isCloud: true, type: 'Vercel KV' };
  if (process.env.UPSTASH_REDIS_REST_URL) return { isCloud: true, type: 'Upstash Redis' };
  return { isCloud: false, type: 'Mémoire locale / Fichier' };
}

async function redisGet<T>(key: string): Promise<T | null> {
  const cfg = getRedisConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/get/${key}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.result === null || json.result === undefined) return null;
    if (typeof json.result === 'string') {
      try {
        return JSON.parse(json.result) as T;
      } catch {
        return json.result as unknown as T;
      }
    }
    return json.result as T;
  } catch (err) {
    console.warn(`[Cloud DB] Warning on GET ${key}:`, err);
    return null;
  }
}

async function redisSet(key: string, value: any): Promise<boolean> {
  const cfg = getRedisConfig();
  if (!cfg) return false;
  try {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    const res = await fetch(`${cfg.url}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Cloud DB] Warning on SET ${key}:`, err);
    return false;
  }
}

// ==================== PERSISTANCE LOCALE & FICHIERS ====================

function ensureDataLoaded() {
  if (isLoaded) return;
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryOrders = parsed;
      }
    } else if (fs.existsSync(TMP_ORDERS_FILE)) {
      const data = fs.readFileSync(TMP_ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
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
    } else if (fs.existsSync(TMP_PRODUCTS_FILE)) {
      const data = fs.readFileSync(TMP_PRODUCTS_FILE, 'utf-8');
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
    try {
      if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
      }
      fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Persist orders to tmp failed:', tmpErr);
    }
  }
}

function persistProducts() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_OVERRIDE_FILE, JSON.stringify(memoryProducts, null, 2), 'utf-8');
  } catch (e) {
    try {
      if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
      }
      fs.writeFileSync(TMP_PRODUCTS_FILE, JSON.stringify(memoryProducts, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Persist products to tmp failed:', tmpErr);
    }
  }
}

// ==================== PRODUITS ====================

export async function getDbProducts(): Promise<Product[]> {
  ensureDataLoaded();

  const cfg = getRedisConfig();
  if (cfg) {
    const cloudProducts = await redisGet<Product[]>('elegance_michou_products');
    if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
      memoryProducts = cloudProducts;
      return memoryProducts;
    } else {
      // Synchroniser les produits initiaux vers le cloud
      await redisSet('elegance_michou_products', memoryProducts);
    }
  }

  return memoryProducts;
}

export async function getDbProductById(id: string): Promise<Product | undefined> {
  const prods = await getDbProducts();
  const normalized = id.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return prods.find(p => {
    if (p.id === id || p.slug === id) return true;
    const pNorm = p.id.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (pNorm === normalized) return true;
    // Tolérance d'alias pour les ensembles en lin
    if (normalized.includes('lin') && normalized.includes('femme') && pNorm.includes('lin') && pNorm.includes('femme')) {
      return true;
    }
    return false;
  });
}

export async function saveDbProduct(productData: Partial<Product> & { name: string; price: number }): Promise<Product> {
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

  const cfg = getRedisConfig();
  if (cfg) {
    await redisSet('elegance_michou_products', memoryProducts);
  }

  return fullProduct;
}

export async function deleteDbProduct(id: string): Promise<boolean> {
  ensureDataLoaded();
  const initialLength = memoryProducts.length;
  memoryProducts = memoryProducts.filter(p => p.id !== id && p.slug !== id);
  if (memoryProducts.length < initialLength) {
    persistProducts();
    const cfg = getRedisConfig();
    if (cfg) {
      await redisSet('elegance_michou_products', memoryProducts);
    }
    return true;
  }
  return false;
}

// ==================== COMMANDES ====================

export async function getDbOrders(): Promise<AdminOrder[]> {
  ensureDataLoaded();

  const cfg = getRedisConfig();
  if (cfg) {
    const cloudOrders = await redisGet<AdminOrder[]>('elegance_michou_orders');
    if (Array.isArray(cloudOrders)) {
      memoryOrders = cloudOrders;
    }
  }

  return memoryOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getDbOrderById(orderNumber: string): Promise<AdminOrder | undefined> {
  const orders = await getDbOrders();
  return orders.find(o => o.orderNumber === orderNumber);
}

export async function createDbOrder(orderData: {
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
}): Promise<AdminOrder> {
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

  const cfg = getRedisConfig();
  if (cfg) {
    await redisSet('elegance_michou_orders', memoryOrders);
  }

  return newOrder;
}

export async function updateDbOrderStatus(orderNumber: string, status: OrderStatus): Promise<AdminOrder | null> {
  ensureDataLoaded();
  const order = memoryOrders.find(o => o.orderNumber === orderNumber);
  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();
  persistOrders();

  const cfg = getRedisConfig();
  if (cfg) {
    await redisSet('elegance_michou_orders', memoryOrders);
  }

  return order;
}

// ==================== STATISTIQUES FINANCIÈRES ====================

export async function getFinancialAnalytics() {
  const orders = await getDbOrders();

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

      const method = order.paymentMethod || 'wave';
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { count: 0, amount: 0 };
      }
      paymentBreakdown[method].count++;
      paymentBreakdown[method].amount += order.total;

      const city = order.city || 'Non spécifiée';
      if (!cityBreakdown[city]) {
        cityBreakdown[city] = { count: 0, amount: 0 };
      }
      cityBreakdown[city].count++;
      cityBreakdown[city].amount += order.total;

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

// ==================== SAUVEGARDE & RESTAURATION ====================

export async function exportDatabaseBackup() {
  const products = await getDbProducts();
  const orders = await getDbOrders();
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalProducts: products.length,
    totalOrders: orders.length,
    products,
    orders,
  };
}

export async function restoreDatabaseBackup(backup: { products?: Product[]; orders?: AdminOrder[] }): Promise<{ success: boolean; countProducts: number; countOrders: number }> {
  ensureDataLoaded();
  let countProducts = 0;
  let countOrders = 0;

  if (Array.isArray(backup.products) && backup.products.length > 0) {
    memoryProducts = backup.products;
    persistProducts();
    const cfg = getRedisConfig();
    if (cfg) {
      await redisSet('elegance_michou_products', memoryProducts);
    }
    countProducts = memoryProducts.length;
  }

  if (Array.isArray(backup.orders)) {
    memoryOrders = backup.orders;
    persistOrders();
    const cfg = getRedisConfig();
    if (cfg) {
      await redisSet('elegance_michou_orders', memoryOrders);
    }
    countOrders = memoryOrders.length;
  }

  return { success: true, countProducts, countOrders };
}
