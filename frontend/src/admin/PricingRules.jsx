import { useEffect, useState } from 'react';
import client from '../api/client.js';

const empty = { productId: '', category: '', ruleType: 'demand', adjustmentPercent: 0, minBoundaryPercent: -15, maxBoundaryPercent: 15, active: true };

export default function PricingRules() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => client.get('/admin/pricing-rules').then(({ data }) => setRules(data));
  useEffect(() => {
    load();
    client.get('/admin/products').then(({ data }) => setProducts(data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, adjustmentPercent: Number(form.adjustmentPercent), minBoundaryPercent: Number(form.minBoundaryPercent), maxBoundaryPercent: Number(form.maxBoundaryPercent) };
    if (!payload.productId) delete payload.productId;
    if (!payload.category) delete payload.category;
    await client.post('/admin/pricing-rules', payload);
    setForm(empty);
    load();
  };

  const toggleActive = async (rule) => { await client.put(`/admin/pricing-rules/${rule.id}`, { active: !rule.active }); load(); };
  const remove = async (id) => { await client.delete(`/admin/pricing-rules/${id}`); load(); };

  return (
    <div>
      <h1 className="font-display text-4xl mb-4">Dynamic Pricing Rule Engine</h1>
      <p className="text-ash text-sm mb-10 max-w-2xl">Every rule is bound by an explicit min/max percentage boundary — there is no autonomous or black-box pricing. Changes are logged to the Price Audit Log.</p>

      <form onSubmit={submit} className="panel p-6 mb-12 grid md:grid-cols-3 gap-4">
        <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value, category: '' })} className="bg-inkDeep border-b border-white/20 focus:border-gold outline-none text-sm py-2">
          <option value="">— Apply to category instead —</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input placeholder="Category (if no product selected)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <select value={form.ruleType} onChange={(e) => setForm({ ...form, ruleType: e.target.value })} className="bg-inkDeep border-b border-white/20 focus:border-gold outline-none text-sm py-2">
          <option value="demand">Demand</option>
          <option value="stock_scarcity">Stock Scarcity</option>
          <option value="vip_discount">VIP Discount</option>
          <option value="seasonal">Seasonal</option>
        </select>
        <input type="number" placeholder="Adjustment %" value={form.adjustmentPercent} onChange={(e) => setForm({ ...form, adjustmentPercent: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <input type="number" placeholder="Min boundary %" value={form.minBoundaryPercent} onChange={(e) => setForm({ ...form, minBoundaryPercent: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <input type="number" placeholder="Max boundary %" value={form.maxBoundaryPercent} onChange={(e) => setForm({ ...form, maxBoundaryPercent: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <button type="submit" className="btn-gold md:col-span-3">Create Rule</button>
      </form>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-ash text-xs uppercase tracking-widest2 border-b border-white/10">
            <tr><th className="text-left px-5 py-3 font-normal">Type</th><th className="text-left px-5 py-3 font-normal">Target</th><th className="text-left px-5 py-3 font-normal">Adjustment</th><th className="text-left px-5 py-3 font-normal">Boundary</th><th className="text-left px-5 py-3 font-normal">Active</th><th></th></tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="px-5 py-3 capitalize">{r.ruleType.replace('_', ' ')}</td>
                <td className="px-5 py-3 text-ash">{r.productId ? 'Product' : r.category || 'All'}</td>
                <td className="px-5 py-3 text-gold">{r.adjustmentPercent > 0 ? '+' : ''}{r.adjustmentPercent}%</td>
                <td className="px-5 py-3 text-ash">{r.minBoundaryPercent}% / {r.maxBoundaryPercent}%</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(r)} className={r.active ? 'text-gold text-xs uppercase tracking-widest2' : 'text-ash text-xs uppercase tracking-widest2'}>{r.active ? 'Active' : 'Inactive'}</button>
                </td>
                <td className="px-5 py-3 text-right"><button onClick={() => remove(r.id)} className="text-ash hover:text-red-400 text-xs uppercase tracking-widest2">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
