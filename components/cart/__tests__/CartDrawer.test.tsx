import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/context/CartContext';
import CartDrawer from '../CartDrawer';
import type { CartItem, Product } from '@/types';

const robeSoleil: Product = {
  id: 'robe-soleil',
  name: 'Robe soleil',
  price: 25000,
  category: 'robes',
  gender: 'femme',
  description: '',
  material: '',
  care: '',
  sizes: ['S'],
  colors: [{ name: 'Rouge', hex: '#FF0000' }],
  images: ['/robe-soleil.jpg'],
};

const pantalonLin: Product = {
  id: 'pantalon-lin',
  name: 'Pantalon lin',
  price: 18000,
  category: 'pantalons',
  gender: 'femme',
  description: '',
  material: '',
  care: '',
  sizes: ['M'],
  colors: [{ name: 'Beige', hex: '#D2B48C' }],
  images: ['/pantalon-lin.jpg'],
};

const miniRobe: CartItem = {
  product: {
    id: 'mini-robe-brode-anglais-100-coton',
    name: 'Mini robe brodé anglais',
    price: 13000,
    category: 'robes',
    gender: 'femme',
    description: '',
    material: '',
    care: '',
    sizes: ['S'],
    colors: [{ name: 'Blanc', hex: '#FFFFFF' }],
    images: ['/mini-robe.jpg'],
  },
  selectedSize: 'S',
  selectedColor: 'Blanc',
  quantity: 6,
  cartItemId: 'mini-robes-S-Blanc',
};

function makeCartItem(product: Product, quantity: number): CartItem {
  return {
    product,
    selectedSize: product.sizes[0],
    selectedColor: product.colors[0].name,
    quantity,
    cartItemId: `${product.id}-${product.sizes[0]}-${product.colors[0].name}`,
  };
}

function renderDrawer(items: CartItem[]) {
  if (items.length > 0) localStorage.setItem('cart', JSON.stringify(items));
  return render(
    <CartProvider>
      <CartDrawer />
    </CartProvider>
  );
}

describe('CartDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('displays the products currently in the cart with their variants', async () => {
    renderDrawer([
      makeCartItem(robeSoleil, 1),
      makeCartItem(pantalonLin, 1),
    ]);

    expect(await screen.findByText('Robe soleil')).toBeInTheDocument();
    expect(screen.getByText('Pantalon lin')).toBeInTheDocument();
    expect(screen.getByText('S · Rouge')).toBeInTheDocument();
    expect(screen.getByText('M · Beige')).toBeInTheDocument();
    expect(screen.getByText('(2 articles)')).toBeInTheDocument();
  });

  it('shows the unit price, line total and cart totals', async () => {
    renderDrawer([makeCartItem(robeSoleil, 1), makeCartItem(pantalonLin, 1)]);

    await screen.findByText('Robe soleil');
    expect(screen.getAllByText('25 000 FCFA').length).toBeGreaterThan(0);
    expect(screen.getAllByText('18 000 FCFA').length).toBeGreaterThan(0);
    expect(screen.getByText('Sous-total')).toBeInTheDocument();
    expect(screen.getByText('43 000 FCFA')).toBeInTheDocument();
    expect(screen.getByText('Livraison')).toBeInTheDocument();
    // 43 000 + 3 500 livraison = 46 500
    expect(screen.getAllByText('46 500 FCFA').length).toBeGreaterThan(0);
    expect(screen.getByText(/Plus que 7 000 FCFA pour la livraison gratuite/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Passer la commande' })).toHaveAttribute('href', '/checkout');
  });

  it('offers free shipping when the subtotal reaches the threshold', async () => {
    renderDrawer([makeCartItem(robeSoleil, 2)]);

    await screen.findByText('Robe soleil');
    expect(screen.getByText(/Livraison offerte/)).toBeInTheDocument();
    // 2 x 25 000 = 50 000, livraison gratuite
    expect(screen.getAllByText(/50 000 FCFA/).length).toBeGreaterThan(0);
  });

  it('applies the volume discount banner for 6+ mini robes', async () => {
    renderDrawer([miniRobe]);

    await screen.findByText('Mini robe brodé anglais');
    expect(screen.getByText(/Offre volume appliquée/)).toBeInTheDocument();
    // 11 000 FCFA appears both in the banner and as the discounted unit price
    expect(screen.getAllByText(/11 000 FCFA/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/économie de/)).toBeInTheDocument();
    expect(screen.getByText('Tarif volume (>5)')).toBeInTheDocument();
    // 6 x 11 000 = 66 000 in line total and grand total
    expect(screen.getAllByText(/66 000 FCFA/).length).toBeGreaterThan(0);
  });

  it('increments and decrements the quantity of an item', async () => {
    const user = userEvent.setup();
    renderDrawer([makeCartItem(robeSoleil, 1)]);

    await screen.findByText('Robe soleil');
    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Augmenter la quantité' }));
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getByText('(2 articles)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Diminuer la quantité' }));
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(screen.getByText('(1 article)')).toBeInTheDocument();
  });

  it('removes an item from the cart', async () => {
    const user = userEvent.setup();
    renderDrawer([makeCartItem(robeSoleil, 1)]);

    await screen.findByText('Robe soleil');
    await user.click(screen.getByRole('button', { name: 'Supprimer l\'article' }));
    expect(await screen.findByText(/Votre panier est vide/)).toBeInTheDocument();
  });

  it('displays an empty state when the cart has no items', async () => {
    renderDrawer([]);
    expect(await screen.findByText(/Votre panier est vide/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuer mes achats' })).toBeInTheDocument();
  });

  it('opens and closes the drawer', async () => {
    const user = userEvent.setup();
    function OpenHarness() {
      const { openDrawer } = useCart();
      return (
        <>
          <button onClick={openDrawer}>Ouvrir le panier</button>
          <CartDrawer />
        </>
      );
    }
    render(
      <CartProvider>
        <OpenHarness />
      </CartProvider>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Ouvrir le panier' }));
    expect(dialog.className).toContain('translate-x-0');

    await user.click(screen.getByRole('button', { name: 'Fermer le panier' }));
    expect(dialog.className).toContain('translate-x-full');
  });

  it('closes the drawer when pressing Escape or clicking the backdrop', async () => {
    const user = userEvent.setup();
    function OpenHarness() {
      const { openDrawer } = useCart();
      return (
        <>
          <button onClick={openDrawer}>Ouvrir le panier</button>
          <CartDrawer />
        </>
      );
    }
    render(
      <CartProvider>
        <OpenHarness />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Ouvrir le panier' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('translate-x-0');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(dialog.className).toContain('translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Ouvrir le panier' }));
    fireEvent.click(document.querySelector('[aria-hidden="true"]') as HTMLElement);
    expect(dialog.className).toContain('translate-x-full');
  });
});