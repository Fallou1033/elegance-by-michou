'use client';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { CartItem, Product } from '@/types';
import { calculateCartTotal } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; selectedSize: string; selectedColor: string; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextValue {
  items: CartItem[];
  isLoaded: boolean;
  isDrawerOpen: boolean;
  addToCart: (product: Product, selectedSize: string, selectedColor: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      const { product, selectedSize, selectedColor, quantity } = action.payload;
      const addQty = quantity && quantity > 0 ? quantity : 1;
      const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
      const existing = state.items.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + addQty } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product, selectedSize, selectedColor, quantity: addQty, cartItemId }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.cartItemId !== action.payload) };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.cartItemId !== action.payload.cartItemId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.cartItemId === action.payload.cartItemId ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isDrawerOpen: false });
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [state.items, isLoaded]);

  const addToCart = useCallback((product: Product, selectedSize: string, selectedColor: string, quantity?: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedSize, selectedColor, quantity } });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const openDrawer = useCallback(() => dispatch({ type: 'OPEN_DRAWER' }), []);
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), []);

  const getCartTotal = useCallback(() =>
    calculateCartTotal(state.items),
    [state.items]
  );

  const getCartCount = useCallback(() =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  );

  return (
    <CartContext.Provider value={{
      items: state.items,
      isLoaded,
      isDrawerOpen: state.isDrawerOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
      openDrawer, closeDrawer, getCartTotal, getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
