import { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { client.get('/admin/pricing-audit-log').then(({ data }) => setLogs(data)); }, []);

  return (
    <div>
      <h1 className="font-display text-4xl mb-4">Price Audit Log</h1>
      <p className="text-ash text-sm mb-10 max-w-2xl">Every automated price adjustment actually applied to a customer, kept for compliance and dispute resolution — never edited, only appended to.</p>

      {logs.length === 0 ? (
        <p className="text-ash text-sm">No adjustments logged yet — prices will appear here once a demand, scarcity, or VIP rule actually changes what a customer sees.</p>
      ) : (
        <div className="panel overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-ash text-xs uppercase tracking-widest2 border-b border-white/10">
              <tr>
                <th className="text-left px-5 py-3 font-normal">When</th>
                <th className="text-left px-5 py-3 font-normal">Base Price</th>
                <th className="text-left px-5 py-3 font-normal">Final Price</th>
                <th className="text-left px-5 py-3 font-normal">Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-white/5">
                  <td className="px-5 py-3 text-ash">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3 text-ash">${Number(l.basePrice).toLocaleString()}</td>
                  <td className="px-5 py-3 text-gold">${Number(l.finalPrice).toLocaleString()}</td>
                  <td className="px-5 py-3">{l.adjustmentPercent > 0 ? '+' : ''}{l.adjustmentPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
