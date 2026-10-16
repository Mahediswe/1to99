import { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { client.get('/admin/orders').then(({ data }) => setOrders(data)); }, []);

  return (
    <div>
      <h1 className="font-display text-4xl mb-10">Orders</h1>
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-ash text-xs uppercase tracking-widest2 border-b border-white/10">
            <tr><th className="text-left px-5 py-3 font-normal">Order</th><th className="text-left px-5 py-3 font-normal">Channel</th><th className="text-left px-5 py-3 font-normal">Items</th><th className="text-left px-5 py-3 font-normal">Total</th><th className="text-left px-5 py-3 font-normal">Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="px-5 py-3">{o.orderNumber}</td>
                <td className="px-5 py-3 capitalize text-ash">{o.channel}{o.isVIP ? ' · VIP' : ''}</td>
                <td className="px-5 py-3 text-ash">{o.items?.length || 0}</td>
                <td className="px-5 py-3 text-gold">${Number(o.total).toLocaleString()}</td>
                <td className="px-5 py-3 capitalize text-ash">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
