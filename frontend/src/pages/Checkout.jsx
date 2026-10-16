import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

const GIFT_WRAP_FEE = 45;
const WHITE_GLOVE_FEE = 120;

export default function Checkout() {
  const { items, subtotal, clearCart, aiAssisted } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vip, setVip] = useState(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [whiteGlove, setWhiteGlove] = useState(false);
  const [address, setAddress] = useState({ line1: '', city: '', country: '' });
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [placing, setPlacing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) client.get('/vip/benefits').then(({ data }) => setVip(data.isMember ? data : null)).catch(() => {});
  }, [user]);

  const giftWrapWaived = vip && ['gold', 'platinum'].includes(vip.tier);
  const whiteGloveWaived = vip && vip.tier === 'platinum';
  const discountRate = vip?.tier === 'platinum' ? 0.1 : vip?.tier === 'gold' ? 0.05 : 0;

  const giftWrapFee = giftWrap && !giftWrapWaived ? GIFT_WRAP_FEE : 0;
  const whiteGloveFee = whiteGlove && !whiteGloveWaived ? WHITE_GLOVE_FEE : 0;
  const discount = subtotal * discountRate;
  const total = subtotal - discount + giftWrapFee + whiteGloveFee;

  const placeOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const { data } = await client.post('/orders/checkout', {
        items: items.map(({ product, quantity, selectedSize }) => ({ productId: product.id, quantity, selectedSize })),
        shippingAddress: address,
        giftWrap,
        whiteGloveDelivery: whiteGlove,
        paymentMethod: 'card',
        aiAssisted,
      });
      setConfirmedOrder(data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed — please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-32 md:pt-40 pb-28 text-center">
        <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center mx-auto mb-8 text-gold text-xl">✓</div>
        <p className="eyebrow mb-4">Order confirmed</p>
        <h1 className="font-display text-4xl mb-6">Thank you, this piece is yours.</h1>
        <p className="text-ash mb-2">Order {confirmedOrder.orderNumber}</p>
        <p className="text-gold text-xl mb-10">${Number(confirmedOrder.total).toLocaleString()}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/account" className="btn-ghost">View Order</Link>
          <button onClick={() => navigate('/shop')} className="btn-gold">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-32 md:pt-40 pb-28">
      <h1 className="font-display text-4xl mb-14">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-14">
        <div className="md:col-span-3">
          <div className="mb-10">
            <p className="eyebrow mb-4">Shipping Address</p>
            <div className="space-y-4">
              <input placeholder="Address line" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
                <input placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
              </div>
            </div>
          </div>

          <div className="mb-10 space-y-3">
            <p className="eyebrow mb-4">Delivery Preferences</p>
            <label className="flex items-center justify-between text-sm text-ash cursor-pointer">
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="accent-gold" />
                Gift wrapping &amp; personalised note
              </span>
              <span className="text-ash/70">{giftWrapWaived ? <span className="text-gold">Complimentary</span> : '+$45'}</span>
            </label>
            <label className="flex items-center justify-between text-sm text-ash cursor-pointer">
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={whiteGlove} onChange={(e) => setWhiteGlove(e.target.checked)} className="accent-gold" />
                Premium white-glove delivery
              </span>
              <span className="text-ash/70">{whiteGloveWaived ? <span className="text-gold">Complimentary</span> : '+$120'}</span>
            </label>
          </div>

          <div className="mb-10">
            <p className="eyebrow mb-4">Payment</p>
            <div className="panel p-6 space-y-4">
              <div className="flex items-center gap-3 text-[11px] text-ash uppercase tracking-widest2 mb-2">
                <span className="border border-white/20 px-2 py-1">Visa</span>
                <span className="border border-white/20 px-2 py-1">Mastercard</span>
                <span className="border border-white/20 px-2 py-1">Amex</span>
                <span className="ml-auto">🔒 Secured demo checkout</span>
              </div>
              <input
                placeholder="Card number"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60 tracking-widest"
              />
              <input
                placeholder="Name on card"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="MM / YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60"
                />
                <input
                  placeholder="CVC"
                  value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60"
                />
              </div>
            </div>
            <p className="text-xs text-ash mt-3">Demo payment gateway — no real charge will be made, and no card data is stored.</p>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="md:col-span-2">
          <div className="panel p-6 sticky top-28">
            <p className="eyebrow mb-5">Order Summary</p>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-1">
              {items.map(({ product, quantity, selectedSize }) => (
                <div key={`${product.id}-${selectedSize || 'na'}`} className="flex gap-3">
                  <img src={product.images?.[0]} alt={product.name} className="w-14 h-16 object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{product.name}</p>
                    <p className="text-xs text-ash">{selectedSize && `Size ${selectedSize} · `}Qty {quantity}</p>
                  </div>
                  <p className="text-sm text-gold whitespace-nowrap">${Number((product.pricing?.finalPrice ?? product.basePrice) * quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between text-ash"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-gold"><span>VIP Discount ({Math.round(discountRate * 100)}%)</span><span>-${discount.toLocaleString()}</span></div>}
              {giftWrapFee > 0 && <div className="flex justify-between text-ash"><span>Gift wrapping</span><span>${giftWrapFee}</span></div>}
              {whiteGloveFee > 0 && <div className="flex justify-between text-ash"><span>White-glove delivery</span><span>${whiteGloveFee}</span></div>}
              <div className="flex justify-between text-lg pt-2"><span>Total</span><span className="text-gold">${total.toLocaleString()}</span></div>
            </div>

            {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
            <button onClick={placeOrder} disabled={placing || items.length === 0} className="btn-gold w-full mt-6 disabled:opacity-50">
              {placing ? 'Processing…' : `Complete Purchase — $${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
