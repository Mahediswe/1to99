import { createContext, useContext, useState, useMemo, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'lxc_cart';

function loadStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const lineKey = (productId, size) => `${productId}::${size || 'default'}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStoredCart); // { product, quantity, selectedSize }
  const [aiAssisted, setAiAssisted] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const size = product.selectedSize || null;
    setItems((prev) => {
      const key = lineKey(product.id, size);
      const existing = prev.find((i) => lineKey(i.product.id, i.selectedSize) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i.product.id, i.selectedSize) === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { product, quantity, selectedSize: size }];
    });
  };

  const removeItem = (productId, size = null) =>
    setItems((prev) => prev.filter((i) => lineKey(i.product.id, i.selectedSize) !== lineKey(productId, size)));

  const updateQuantity = (productId, quantity, size = null) =>
    setItems((prev) => prev.map((i) => (lineKey(i.product.id, i.selectedSize) === lineKey(productId, size) ? { ...i, quantity: Math.max(1, quantity) } : i)));

  const clearCart = () => { setItems([]); setAiAssisted(false); };

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.product.pricing?.finalPrice ?? i.product.basePrice) * i.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, count, aiAssisted, setAiAssisted }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
