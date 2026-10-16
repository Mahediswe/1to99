import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const TIERS = [
  { name: 'Silver', perks: ['Early access to new arrivals', 'Birthday gift'] },
  { name: 'Gold', perks: ['Early access to new arrivals', 'Complimentary gift wrapping', 'Dedicated stylist chat'] },
  { name: 'Platinum', perks: ['All Gold benefits', 'White-glove delivery on every order', 'Private appointment booking', 'Step-up 2FA account protection'] },
];

export default function Vip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) client.get('/vip/benefits').then(({ data }) => setMembership(data.isMember ? data : null));
  }, [user]);

  const join = async () => {
    if (!user) return navigate('/login');
    setLoading(true);
    const { data } = await client.post('/vip/join');
    setMembership({ isMember: true, ...data });
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-32 md:pt-40 pb-28 text-center">
      <p className="eyebrow mb-4">Exclusive access</p>
      <h1 className="font-display text-5xl mb-6">VIP Membership</h1>
      <p className="text-ash max-w-xl mx-auto mb-16">A private tier for those who shop with intention — priority access, personal styling, and privileges that scale with you.</p>

      {membership ? (
        <div className="panel p-10 max-w-md mx-auto mb-16">
          <p className="eyebrow mb-2">Your status</p>
          <p className="font-display text-3xl text-gold mb-4 capitalize">{membership.tier}</p>
          <p className="text-sm text-ash">{membership.points} points earned</p>
        </div>
      ) : (
        <button onClick={join} disabled={loading} className="btn-gold mb-16">{loading ? 'Joining…' : 'Join VIP — Complimentary'}</button>
      )}

      <div className="grid md:grid-cols-3 gap-10 text-left">
        {TIERS.map((tier) => (
          <div key={tier.name} className="panel p-8">
            <h3 className="font-display text-2xl text-gold mb-6">{tier.name}</h3>
            <ul className="space-y-3 text-sm text-ash">
              {tier.perks.map((p) => <li key={p}>— {p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
