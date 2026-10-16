import { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function MarketIntelligence() {
  const [data, setData] = useState(null);

  useEffect(() => { client.get('/admin/market-intelligence').then(({ data }) => setData(data)); }, []);
  if (!data) return <div className="h-64 skeleton" />;

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Market Intelligence</h1>
      <p className="text-ash text-sm mb-10 max-w-2xl">Platform performance benchmarked against cited industry research. Figures are attributed to their source and dated — this is analysis, not live third-party data.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
        <div className="panel p-6"><p className="eyebrow mb-2">AI Conversion Rate</p><p className="font-display text-3xl text-gold">{data.platform.aiConversionRate}%</p></div>
        <div className="panel p-6"><p className="eyebrow mb-2">VIP Penetration</p><p className="font-display text-3xl text-gold">{data.platform.vipPenetration}%</p></div>
        <div className="panel p-6"><p className="eyebrow mb-2">Total Orders</p><p className="font-display text-3xl text-gold">{data.platform.totalOrders}</p></div>
        <div className="panel p-6"><p className="eyebrow mb-2">Catalog Size</p><p className="font-display text-3xl text-gold">{data.platform.totalProducts}</p></div>
      </div>

      <p className="eyebrow mb-4">Industry Benchmarks</p>
      <div className="panel overflow-hidden mb-14">
        <table className="w-full text-sm">
          <thead className="text-ash text-xs uppercase tracking-widest2 border-b border-white/10">
            <tr><th className="text-left px-5 py-3 font-normal">Metric</th><th className="text-left px-5 py-3 font-normal">Figure</th><th className="text-left px-5 py-3 font-normal">Source</th></tr>
          </thead>
          <tbody>
            {data.industryBenchmarks.map((b) => (
              <tr key={b.metric} className="border-b border-white/5 align-top">
                <td className="px-5 py-4">
                  {b.metric}
                  {b.note && <p className="text-xs text-ash/70 mt-1">{b.note}</p>}
                </td>
                <td className="px-5 py-4 text-gold whitespace-nowrap">{b.value}</td>
                <td className="px-5 py-4 text-ash whitespace-nowrap">{b.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="eyebrow mb-4">Competitive Landscape</p>
      <div className="grid md:grid-cols-3 gap-6">
        {data.competitiveLandscape.map((c) => (
          <div key={c.name} className="panel p-6">
            <h3 className="font-display text-lg mb-3">{c.name}</h3>
            <p className="text-xs text-ash mb-2"><span className="text-gold">Strength: </span>{c.strength}</p>
            <p className="text-xs text-ash"><span className="text-ash/70">Gap: </span>{c.gap}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
