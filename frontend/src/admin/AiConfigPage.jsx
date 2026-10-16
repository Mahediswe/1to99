import { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function AiConfigPage() {
  const [config, setConfig] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [prohibited, setProhibited] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get('/admin/ai-config').then(({ data }) => { setConfig(data); setProhibited(data.prohibitedTopics.join(', ')); });
    client.get('/admin/ai-performance').then(({ data }) => setPerformance(data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...config, prohibitedTopics: prohibited.split(',').map((s) => s.trim()).filter(Boolean) };
    const { data } = await client.put('/admin/ai-config', payload);
    setConfig(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!config) return <p className="text-ash text-sm">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-4xl mb-4">AI Assistant Configuration</h1>
      <p className="text-ash text-sm mb-10 max-w-2xl">Guardrails, tone, and prohibited topics for the conversational assistant. The assistant is strictly Assistive/Read-only — it cannot write prices, orders, or discounts under any configuration.</p>

      {performance && (
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="panel p-6"><p className="eyebrow mb-2">Conversations</p><p className="font-display text-3xl text-gold">{performance.totalConversations}</p></div>
          <div className="panel p-6"><p className="eyebrow mb-2">AI-Assisted Orders</p><p className="font-display text-3xl text-gold">{performance.aiAssistedOrders}</p></div>
          <div className="panel p-6"><p className="eyebrow mb-2">Conversion Rate</p><p className="font-display text-3xl text-gold">{performance.aiConversionRate}%</p></div>
        </div>
      )}

      <form onSubmit={save} className="panel p-6 space-y-6 max-w-xl">
        <div>
          <p className="eyebrow mb-2">Tone</p>
          <input value={config.tone} onChange={(e) => setConfig({ ...config, tone: e.target.value })} className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        </div>
        <div>
          <p className="eyebrow mb-2">Prohibited Topics (comma-separated)</p>
          <input value={prohibited} onChange={(e) => setProhibited(e.target.value)} className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        </div>
        <div>
          <p className="eyebrow mb-2">Max Upsell Items</p>
          <input type="number" value={config.maxUpsellItems} onChange={(e) => setConfig({ ...config, maxUpsellItems: Number(e.target.value) })} className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2" />
        </div>
        <button type="submit" className="btn-gold">{saved ? 'Saved ✓' : 'Save Configuration'}</button>
      </form>
    </div>
  );
}
