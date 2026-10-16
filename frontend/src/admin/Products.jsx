import { useEffect, useState } from 'react';
import client from '../api/client.js';

const empty = { name: '', brand: '', description: '', story: '', basePrice: '', category: '', images: '', semanticTags: '', stock: 0, isLimitedEdition: false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = () => client.get('/admin/products').then(({ data }) => setProducts(data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      stock: Number(form.stock),
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      semanticTags: form.semanticTags.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (editingId) await client.put(`/admin/products/${editingId}`, payload);
    else await client.post('/admin/products', payload);
    setForm(empty);
    setEditingId(null);
    load();
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({ ...p, images: p.images.join(', '), semanticTags: p.semanticTags.join(', ') });
  };

  const remove = async (id) => { await client.delete(`/admin/products/${id}`); load(); };

  return (
    <div>
      <h1 className="font-display text-4xl mb-10">Products</h1>

      <form onSubmit={submit} className="panel p-6 mb-12 grid md:grid-cols-2 gap-4">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <input required type="number" placeholder="Base price" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <label className="flex items-center gap-2 text-sm text-ash">
          <input type="checkbox" checked={form.isLimitedEdition} onChange={(e) => setForm({ ...form, isLimitedEdition: e.target.checked })} className="accent-gold" />
          Limited Edition
        </label>
        <input placeholder="Image URLs (comma-separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="md:col-span-2 bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <input placeholder="Semantic tags (comma-separated)" value={form.semanticTags} onChange={(e) => setForm({ ...form, semanticTags: e.target.value })} className="md:col-span-2 bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2 bg-transparent border border-white/20 focus:border-gold outline-none text-sm p-3" rows={2} />
        <textarea placeholder="Provenance / story" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} className="md:col-span-2 bg-transparent border border-white/20 focus:border-gold outline-none text-sm p-3" rows={2} />
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="btn-gold">{editingId ? 'Update Product' : 'Add Product'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="btn-ghost">Cancel</button>}
        </div>
      </form>

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-ash text-xs uppercase tracking-widest2 border-b border-white/10">
            <tr><th className="text-left px-5 py-3 font-normal">Name</th><th className="text-left px-5 py-3 font-normal">Price</th><th className="text-left px-5 py-3 font-normal">Stock</th><th className="px-5 py-3"></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="px-5 py-3">{p.name}</td>
                <td className="px-5 py-3 text-gold">${Number(p.basePrice).toLocaleString()}</td>
                <td className="px-5 py-3 text-ash">{p.stock}</td>
                <td className="px-5 py-3 text-right space-x-3">
                  <button onClick={() => edit(p)} className="text-gold hover:text-goldSoft text-xs uppercase tracking-widest2">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-ash hover:text-red-400 text-xs uppercase tracking-widest2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
