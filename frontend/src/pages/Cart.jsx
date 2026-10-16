import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-32 md:pt-40 pb-28 text-center">
        <h1 className="font-display text-4xl mb-6">Your Bag</h1>
        <p className="text-ash mb-8">Your bag is empty. Let the AI assistant help you find something extraordinary.</p>
        <Link to="/shop" className="btn-gold">Return to the Boutique</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 md:pt-40 pb-28">
      <h1 className="font-display text-4xl mb-14">Your Bag</h1>
      <div className="space-y-8">
        {items.map(({ product, quantity, selectedSize }) => (
          <div key={`${product.id}-${selectedSize || 'na'}`} className="flex gap-6 border-b border-white/10 pb-8">
            <img src={product.images?.[0]} alt={product.name} className="w-28 h-32 object-cover" />
            <div className="flex-1">
              <p className="eyebrow mb-1">{product.brand}</p>
              <h3 className="font-display text-xl mb-1">{product.name}</h3>
              {selectedSize && <p className="text-xs text-ash mb-2">Size: {selectedSize}</p>}
              <p className="text-gold text-sm mb-3">${Number(product.pricing?.finalPrice ?? product.basePrice).toLocaleString()}</p>
              <div className="flex items-center gap-3 text-sm">
                <button onClick={() => updateQuantity(product.id, quantity - 1, selectedSize)} className="w-7 h-7 border border-white/20 hover:border-gold">−</button>
                <span>{quantity}</span>
                <button onClick={() => updateQuantity(product.id, quantity + 1, selectedSize)} className="w-7 h-7 border border-white/20 hover:border-gold">+</button>
                <button onClick={() => removeItem(product.id, selectedSize)} className="ml-4 text-ash hover:text-gold text-xs uppercase tracking-widest2">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-between items-baseline">
        <span className="eyebrow">Subtotal</span>
        <span className="text-2xl text-gold">${subtotal.toLocaleString()}</span>
      </div>
      <button onClick={() => navigate('/checkout')} className="btn-gold w-full mt-8">Proceed to Checkout</button>
    </div>
  );
}
