import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '@/context/CartContext';
import CheckoutPage from '../page';
import type { CartItem, Product } from '@/types';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

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

const cartItem: CartItem = {
  product: robeSoleil,
  selectedSize: 'S',
  selectedColor: 'Rouge',
  quantity: 1,
  cartItemId: 'robe-soleil-S-Rouge',
};

function renderCheckout() {
  localStorage.setItem('cart', JSON.stringify([cartItem]));
  return render(
    <CartProvider>
      <CheckoutPage />
    </CartProvider>
  );
}

const VALID_FORM = {
  fullName: 'Awa Fall',
  phone: '+221 77 123 45 67',
  address: 'Rue 10, Almadies',
  city: 'Dakar',
};

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/nom complet/i), VALID_FORM.fullName);
  await user.type(screen.getByLabelText(/téléphone/i), VALID_FORM.phone);
  await user.type(screen.getByLabelText(/adresse de livraison/i), VALID_FORM.address);
  await user.selectOptions(screen.getByLabelText(/ville/i), VALID_FORM.city);
}

describe('Checkout', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockReset();
    (global.fetch as jest.Mock).mockReset();
  });

  it('shows a message when the cart is empty', async () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );
    expect(await screen.findByText(/Votre panier est vide/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Retourner à la boutique/ })).toBeInTheDocument();
  });

  it('displays the products of the cart in the order summary', async () => {
    renderCheckout();
    expect(await screen.findByText('Finaliser ma commande')).toBeInTheDocument();
    // The product appears once in the mobile summary and once in the desktop sidebar
    expect(screen.getAllByText('Robe soleil')).toHaveLength(2);
    expect(screen.getAllByText('S · Rouge')).toHaveLength(2);
    expect(screen.getAllByText('Récapitulatif de commande')).toHaveLength(2);
  });

  it('blocks submission when required fields are missing', async () => {
    const user = userEvent.setup();
    renderCheckout();

    await screen.findByText('Finaliser ma commande');
    await user.click(screen.getByRole('button', { name: /Payer/ }));

    expect(await screen.findByText(/Veuillez saisir votre nom complet/)).toBeInTheDocument();
    expect(screen.getByText(/Le numéro de téléphone est requis/)).toBeInTheDocument();
    expect(screen.getByText(/Veuillez saisir votre adresse complète/)).toBeInTheDocument();
    expect(screen.getByText(/Veuillez sélectionner votre ville/)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects a phone number with an invalid format', async () => {
    const user = userEvent.setup();
    renderCheckout();

    await screen.findByText('Finaliser ma commande');
    await user.type(screen.getByLabelText(/nom complet/i), VALID_FORM.fullName);
    await user.type(screen.getByLabelText(/téléphone/i), '99 00 00 00');
    await user.type(screen.getByLabelText(/adresse de livraison/i), VALID_FORM.address);
    await user.selectOptions(screen.getByLabelText(/ville/i), VALID_FORM.city);

    await user.click(screen.getByRole('button', { name: /Payer/ }));

    expect(await screen.findByText(/Format invalide/)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('accepts a valid Senegalese phone number', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(async () => ({
      json: async () => ({}),
    }));
    renderCheckout();

    await screen.findByText('Finaliser ma commande');
    await fillValidForm(user);

    await user.click(screen.getByRole('button', { name: /Payer/ }));

    await waitFor(() => {
      expect(screen.queryByText(/Format invalide/)).not.toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('submits the order, records it and redirects to the confirmation page', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      if (url.includes('/api/orders/create')) return { json: async () => ({ ok: true }) };
      return { json: async () => ({}) };
    });
    renderCheckout();

    await screen.findByText('Finaliser ma commande');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Payer/ }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/orders/create', expect.objectContaining({ method: 'POST' }));
      expect(global.fetch).toHaveBeenCalledWith('/api/wave/payment', expect.objectContaining({ method: 'POST' }));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/confirmation?ref=CMD-'));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('payment=wave'));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('mode=direct'));
    });

    // The cart is cleared after a successful order
    expect(await screen.findByText(/Votre panier est vide/)).toBeInTheDocument();
  });

  it('switches the payment method to Orange Money', async () => {
    const user = userEvent.setup();
    renderCheckout();

    await screen.findByText('Finaliser ma commande');
    await user.click(screen.getByRole('button', { name: /Paiement direct Orange Money/ }));

    expect(screen.getByRole('button', { name: /Payer .* via Orange Money/ })).toBeInTheDocument();
  });
});