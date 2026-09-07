export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  category: 'robes' | 'hauts' | 'pantalons' | 'accessoires' | 'homme' | 'jupes' | 'ensembles';
  categoryLabel?: string;
  gender: 'femme' | 'homme' | 'unisexe';
  description: string;
  material: string;
  care: string;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  hoverImage?: string;
  badge?: 'Nouveau' | 'Promo';
  isNew?: boolean;
  discount?: number;
  relatedProducts?: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  cartItemId: string;
}

export interface OrderData {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: 'cash' | 'wave' | 'orange-money';
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
}
