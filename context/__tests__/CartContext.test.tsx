import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import type { Product } from '@/types';

const miniRobe: Product = {
  id: 'mini-robe-brode-anglais-100-coton',
  name: 'Mini robe brodé anglais',
  price: 13000,
  category: 'robes',
  gender: 'femme',
  description: '',
  material: '',
  care: '',
  sizes: ['S'],
  colors: [{ name: 'Blanc Broderie', hex: '#FAF9F6' }],
  images: ['/image.jpg'],
};

function Harness() {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
  } = useCart();

  return (
    <div>
      <p data-testid="count">{getCartCount()}</p>
      <ul data-testid="items">
        {items.map(item => (
          <li key={item.cartItemId} data-testid="line">
            {item.product.name}|{item.selectedSize}|{item.selectedColor}|{item.quantity}|{item.cartItemId}
          </li>
        ))}
      </ul>
      <button onClick={() => addToCart(miniRobe, 'S', 'Blanc Broderie')}>add same</button>
      <button onClick={() => addToCart(miniRobe, 'S', 'Rouge Pastel')}>add other color</button>
      <button onClick={() => addToCart(miniRobe, 'M', 'Blanc Broderie')}>add other size</button>
      <button
        onClick={() => {
          const first = items[0];
          if (first) removeFromCart(first.cartItemId);
        }}
      >
        remove first
      </button>
      <button
        onClick={() => {
          const first = items[0];
          if (first) updateQuantity(first.cartItemId, 3);
        }}
      >
        set qty 3
      </button>
      <button
        onClick={() => {
          const first = items[0];
          if (first) updateQuantity(first.cartItemId, 0);
        }}
      >
        set qty 0
      </button>
      <button onClick={clearCart}>clear</button>
    </div>
  );
}

function renderHarness() {
  return render(
    <CartProvider>
      <Harness />
    </CartProvider>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    renderHarness();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.queryAllByTestId('line')).toHaveLength(0);
  });

  it('adds a product to the cart', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    const lines = screen.getAllByTestId('line');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveTextContent('Mini robe brodé anglais|S|Blanc Broderie|1');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('increments the quantity when the exact same variant is added again', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    const lines = screen.getAllByTestId('line');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveTextContent('|S|Blanc Broderie|2|');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('creates a distinct line for a different color', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'add other color' }));
    expect(screen.getAllByTestId('line')).toHaveLength(2);
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('creates a distinct line for a different size', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'add other size' }));
    expect(screen.getAllByTestId('line')).toHaveLength(2);
  });

  it('removes an item from the cart', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'add other color' }));
    fireEvent.click(screen.getByRole('button', { name: 'remove first' }));
    const lines = screen.getAllByTestId('line');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveTextContent('|S|Rouge Pastel|');
  });

  it('updates the quantity of an item', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'set qty 3' }));
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('removes the item when its quantity drops to 0', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'set qty 0' }));
    expect(screen.queryAllByTestId('line')).toHaveLength(0);
  });

  it('clears the whole cart', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'add other color' }));
    fireEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.queryAllByTestId('line')).toHaveLength(0);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('persists the cart in localStorage', () => {
    renderHarness();
    fireEvent.click(screen.getByRole('button', { name: 'add same' }));
    fireEvent.click(screen.getByRole('button', { name: 'add other color' }));
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(saved).toHaveLength(2);
  });

  it('restores a saved cart from localStorage on mount', () => {
    const saved = [
      {
        product: miniRobe,
        selectedSize: 'S',
        selectedColor: 'Noir',
        quantity: 2,
        cartItemId: 'mini-robe-brode-anglais-100-coton-S-Noir',
      },
    ];
    localStorage.setItem('cart', JSON.stringify(saved));
    renderHarness();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('line')).toHaveTextContent('|S|Noir|2|');
  });
});