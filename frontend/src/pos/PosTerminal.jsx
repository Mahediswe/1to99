import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PosTerminal() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [sale, setSale] = useState([]); // { product, quantity }
  const [category, setCategory] = useState('All');
  const [customerId, setCustomerId] = useState('');
  const [clienteling, setClienteling] = useState(null);
  const [complete, setComplete] = useState(null);

  useEffect(() => { client.get('/products').then(({ data }) => setProducts(data)); }, []);

  if (loading) return null;
  if (!user || (user.role !== 'pos_staff' && user.role !== 'super_admin')) return <Navigate to="/login" replace />;

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
  const visible = category === 'All' ? products : products.filter((p) => p.category === category);

  const addToSale = (product) => {
    setSale((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { product, quantity: 1 }];
    });
  };

  const subtotal = sale.reduce((s, i) => s + Number(i.product.basePrice) * i.quantity, 0);

  const lookupCustomer = async () => {
    if (!customerId) return setClienteling(null);
    try {
      const { data } = await client.get(`/pos/clienteling/${customerId}`);
      setClienteling(data);
    } catch { setClienteling(null); }
  };

  const chargeSale = async (paymentMethod) => {
    const { data: terminals } = await client.get('/pos/terminals');
    const terminalId = terminals[0]?.id;
    const { data } = await client.post('/pos/sale', {
      terminalId,
      userId: customerId || null,
      items: sale.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      paymentMethod,
    });
    setComplete(data.order);
    setSale([]);
    setCustomerId('');
    setClienteling(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-28">
      <p className="eyebrow mb-2">Boutique Terminal</p>
      <h1 className="font-display text-4xl mb-10">Point of Sale</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <div className="flex gap-3 mb-6 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`text-xs uppercase tracking-widest2 px-4 py-2 border ${category === c ? 'border-gold text-gold' : 'border-white/20 text-ash'}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {visible.map((p) => (
              <button key={p.id} onClick={() => addToSale(p)} className="panel p-4 text-left hover:border-gold/40 transition-colors">
                <p className="text-sm">{p.name}</p>
                <p className="text-gold text-xs mt-1">${Number(p.basePrice).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="panel p-6 mb-6">
            <p className="eyebrow mb-3">Clienteling Lookup</p>
            <div className="flex gap-2 mb-3">
              <input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Customer user ID" className="flex-1 bg-transparent border-b border-white/20 focus:border-gold outline-none text-xs py-2" />
              <button onClick={lookupCustomer} className="text-xs text-gold uppercase tracking-widest2">Find</button>
            </div>
            {clienteling && (
              <div className="text-xs text-ash space-y-1">
                <p className="text-parchment">{clienteling.customer.name}</p>
                <p>VIP: <span className="text-gold capitalize">{clienteling.vipTier || 'None'}</span></p>
                <p>Style tags: {clienteling.learnedTags.join(', ') || '—'}</p>
              </div>
            )}
          </div>

          <div className="panel p-6">
            <p className="eyebrow mb-4">Current Sale</p>
            <div className="space-y-3 mb-6 max-h-56 overflow-y-auto">
              {sale.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.name} × {quantity}</span>
                  <span className="text-gold">${(product.basePrice * quantity).toLocaleString()}</span>
                </div>
              ))}
              {sale.length === 0 && <p className="text-ash text-xs">No items yet</p>}
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4 mb-6">
              <span className="eyebrow">Total</span>
              <span className="text-xl text-gold">${subtotal.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['cash', 'card', 'mobile'].map((m) => (
                <button key={m} onClick={() => sale.length && chargeSale(m)} className="btn-ghost !px-2 !py-2 text-[10px] capitalize">{m}</button>
              ))}
            </div>
          </div>

          {complete && (
            <p className="text-xs text-gold mt-4">✓ Sale {complete.orderNumber} completed — ${Number(complete.total).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
