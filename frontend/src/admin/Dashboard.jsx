import { useEffect, useState } from 'react';
import client from '../api/client.js';

function KpiCard({ label, value }) {
  return (
    <div className="panel p-6">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-display text-3xl text-gold">{value}</p>
    </div>
  );
}

function SalesTrendChart({ data }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.total), 1);
  const w = 560, h = 160, pad = 8;
  const step = (w - pad * 2) / (data.length - 1 || 1);
  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = h - pad - (d.total / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${pad + (data.length - 1) * step},${h - pad} L${pad},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <defs>
        <linearGradient id="salesFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C6A15B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#salesFade)" />
      <path d={linePath} fill="none" stroke="#C6A15B" strokeWidth="1.5" />
      {data.map((d, i) => {
        const x = pad + i * step;
        const y = h - pad - (d.total / max) * (h - pad * 2);
        return <circle key={d.date} cx={x} cy={y} r="2" fill="#C6A15B" />;
      })}
    </svg>
  );
}

function CategoryDonut({ data }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const colors = ['#C6A15B', '#8A8F98', '#E4CFA0', '#5B5F6A', '#7A6A45', '#A5ABB6'];
  let cumulative = 0;
  const radius = 60, cx = 70, cy = 70, circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0 -rotate-90">
        {data.map((d, i) => {
          const fraction = d.count / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const offset = -cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={d.category}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div className="space-y-2 text-xs">
        {data.map((d, i) => (
          <div key={d.category} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-ash">{d.category}</span>
            <span className="text-parchment">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    client.get('/admin/dashboard').then(({ data }) => setData(data));
    client.get('/admin/dashboard/charts').then(({ data }) => setCharts(data));
  }, []);

  if (!data) {
    return (
      <div>
        <div className="h-10 w-48 skeleton mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl mb-10">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <KpiCard label="Total Sales" value={`$${Number(data.totalSales).toLocaleString()}`} />
        <KpiCard label="AI-Assisted Orders" value={data.aiAssistedOrders} />
        <KpiCard label="VIP Members" value={data.vipMembers} />
        <KpiCard label="Active Price Rules" value={data.activePriceRules} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-14">
        <div className="panel p-6">
          <p className="eyebrow mb-4">Sales Trend — Last 14 Days</p>
          {charts ? <SalesTrendChart data={charts.salesTrend} /> : <div className="h-40 skeleton" />}
        </div>
        <div className="panel p-6">
          <p className="eyebrow mb-4">Category Distribution</p>
          {charts ? <CategoryDonut data={charts.categoryDistribution} /> : <div className="h-40 skeleton" />}
        </div>
      </div>

      <p className="eyebrow mb-4">Recent Orders</p>
      <div className="panel overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-ash text-xs uppercase tracking-widest2 border-b border-white/10">
            <tr>
              <th className="text-left px-5 py-3 font-normal">Order</th>
              <th className="text-left px-5 py-3 font-normal">Channel</th>
              <th className="text-left px-5 py-3 font-normal">AI Assisted</th>
              <th className="text-left px-5 py-3 font-normal">Total</th>
              <th className="text-left px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="px-5 py-3">{o.orderNumber}</td>
                <td className="px-5 py-3 capitalize text-ash">{o.channel}</td>
                <td className="px-5 py-3 text-ash">{o.aiAssisted ? 'Yes' : '—'}</td>
                <td className="px-5 py-3 text-gold">${Number(o.total).toLocaleString()}</td>
                <td className="px-5 py-3 capitalize text-ash">{o.status}</td>
              </tr>
            ))}
            {data.recentOrders.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-ash">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
