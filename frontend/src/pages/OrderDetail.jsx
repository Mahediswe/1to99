import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client.js';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    client.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => setError(true));
  }, [id]);

  if (error) return (
    <div className="max-w-xl mx-auto px-6 pt-32 md:pt-40 pb-28 text-center">
      <p className="text-ash mb-6">Order not found.</p>
      <Link to="/account" className="btn-ghost">Back to Account</Link>
    </div>
  );
  if (!order) return <div className="pt-32 md:pt-40 max-w-3xl mx-auto px-6 text-ash">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 md:pt-32 md:pt-40 pb-28">
      <p className="eyebrow mb-3">Order</p>
      <h1 className="font-display text-4xl mb-2">{order.orderNumber}</h1>
      <p className="text-xs text-ash uppercase tracking-widest2 mb-10">{order.status}{order.aiAssisted ? ' — AI Assisted' : ''}{order.isVIP ? ' — VIP' : ''}</p>

      <div className="space-y-4 mb-10">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between border-b border-white/10 pb-4">
            <span className="text-sm">{item.nameSnapshot} × {item.quantity}</span>
            <span className="text-gold text-sm">${Number(item.priceSnapshot * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-ash"><span>Subtotal</span><span>${Number(order.subtotal).toLocaleString()}</span></div>
        {Number(order.discount) > 0 && <div className="flex justify-between text-gold"><span>VIP Discount</span><span>-${Number(order.discount).toLocaleString()}</span></div>}
        <div className="flex justify-between text-lg pt-3 border-t border-white/10"><span>Total</span><span className="text-gold">${Number(order.total).toLocaleString()}</span></div>
      </div>

      <Link to="/account" className="btn-ghost mt-12 inline-block">Back to Account</Link>
    </div>
  );
}
