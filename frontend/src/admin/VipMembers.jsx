import { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function VipMembers() {
  const [members, setMembers] = useState([]);
  useEffect(() => { client.get('/admin/vip-members').then(({ data }) => setMembers(data)); }, []);

  return (
    <div>
      <h1 className="font-display text-4xl mb-10">VIP Members</h1>
      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-ash text-xs uppercase tracking-widest2 border-b border-white/10">
            <tr><th className="text-left px-5 py-3 font-normal">Name</th><th className="text-left px-5 py-3 font-normal">Email</th><th className="text-left px-5 py-3 font-normal">Tier</th><th className="text-left px-5 py-3 font-normal">Points</th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-white/5">
                <td className="px-5 py-3">{m.User?.name}</td>
                <td className="px-5 py-3 text-ash">{m.User?.email}</td>
                <td className="px-5 py-3 text-gold capitalize">{m.tier}</td>
                <td className="px-5 py-3 text-ash">{m.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
