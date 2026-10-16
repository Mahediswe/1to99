import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const TABS = ['Orders', 'Wishlist', 'Style Profile', 'AI History'];

export default function Account() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Orders');
  const [orders, setOrders] = useState([]);
  const [vip, setVip] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    client.get('/orders/mine').then(({ data }) => setOrders(data)).catch(() => {});
    client.get('/vip/benefits').then(({ data }) => setVip(data.isMember ? data : null)).catch(() => {});
    client.get('/me/wishlist').then(({ data }) => setWishlist(data)).catch(() => {});
    client.get('/me/style-profile').then(({ data }) => setProfile(data)).catch(() => {});
    client.get('/me/ai-history').then(({ data }) => setHistory(data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-32 md:pt-32 md:pt-40 pb-28">
      <p className="eyebrow mb-3">Welcome</p>
      <h1 className="font-display text-4xl mb-10">{user?.name}</h1>

      {vip && (
        <div className="panel p-6 mb-10 inline-flex items-center gap-4">
          <div>
            <p className="eyebrow mb-1">VIP Status</p>
            <p className="font-display text-2xl text-gold capitalize">{vip.tier} member</p>
          </div>
        </div>
      )}

      <div className="flex gap-8 border-b border-white/10 mb-10 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-4 text-xs uppercase tracking-widest2 whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t ? 'border-gold text-gold' : 'border-transparent text-ash hover:text-parchment'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Orders' && (
        orders.length === 0 ? <p className="text-ash text-sm">No orders yet.</p> : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Link key={o.id} to={`/order/${o.id}`} className="flex justify-between items-center border-b border-white/10 pb-4 hover:opacity-70 transition-opacity">
                <div>
                  <p className="text-sm">{o.orderNumber}</p>
                  <p className="text-xs text-ash uppercase tracking-widest2">{o.status}{o.aiAssisted ? ' — AI Assisted' : ''}</p>
                </div>
                <p className="text-gold">${Number(o.total).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === 'Wishlist' && (
        wishlist.length === 0 ? <p className="text-ash text-sm">Nothing saved yet — browse the atelier and tap "Save to Wishlist" on a piece you love.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )
      )}

      {tab === 'Style Profile' && profile && (
        <div className="panel p-8 max-w-xl">
          <p className="eyebrow mb-4">What the AI has learned</p>
          {profile.learnedTags.length === 0 ? (
            <p className="text-ash text-sm">Chat with the AI assistant and your style preferences will appear here automatically.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.learnedTags.map((t) => (
                <span key={t} className="text-xs border border-gold/40 text-gold px-3 py-1 capitalize">{t}</span>
              ))}
            </div>
          )}
          {profile.preferences?.categories?.length > 0 && (
            <>
              <p className="eyebrow mb-2 mt-6">Preferred categories</p>
              <p className="text-sm text-ash">{profile.preferences.categories.join(', ')}</p>
            </>
          )}
        </div>
      )}

      {tab === 'AI History' && (
        history.length === 0 ? <p className="text-ash text-sm">No conversations with your AI shopping assistant yet.</p> : (
          <div className="space-y-6">
            {history.map((h) => (
              <div key={h.id} className="panel p-5">
                <p className="text-xs text-ash uppercase tracking-widest2 mb-3">{new Date(h.createdAt).toLocaleDateString()}</p>
                <div className="space-y-2">
                  {h.messages.slice(-4).map((m, i) => (
                    <p key={i} className={`text-sm ${m.role === 'user' ? 'text-parchment' : 'text-ash'}`}>
                      <span className="text-xs uppercase tracking-widest2 mr-2 text-gold/70">{m.role === 'user' ? 'You' : 'AI'}</span>
                      {m.content}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab !== 'Orders' && orders.length === 0 && tab === 'Orders' && (
        <Link to="/shop" className="btn-gold mt-6 inline-block">Start Shopping</Link>
      )}
    </div>
  );
}
