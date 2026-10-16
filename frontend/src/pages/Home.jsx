import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import { getRecentlyViewed } from '../utils/recentlyViewed.js';

function CardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] skeleton" />
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-16 skeleton" />
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-3 w-12 skeleton" />
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  { quote: 'The AI assistant found exactly the gown I was picturing in under a minute — something I\'d have spent an afternoon searching for elsewhere.', name: 'S. Rahman', title: 'VIP Platinum Member' },
  { quote: 'What sold me was the honesty of the pricing. No games, no fake urgency — just a clear rule I could see for myself.', name: 'A. Chowdhury', title: 'First-time Customer' },
  { quote: 'The white-glove delivery and the story behind every piece make this feel like a boutique, not a marketplace.', name: 'F. Islam', title: 'VIP Gold Member' },
];

const TRUST_STATS = [
  { value: '~50%', label: 'of online shoppers projected to use AI agents by 2030', source: 'Morgan Stanley' },
  { value: '$1T+', label: 'projected agentic-commerce market by 2030', source: 'McKinsey' },
  { value: '5×', label: 'higher conversion from AI-assisted discovery vs. average search', source: 'Industry analysis' },
];

export default function Home() {
  const [homepage, setHomepage] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    client.get('/products/homepage').then(({ data }) => setHomepage(data));
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    await client.post('/newsletter/subscribe', { email, source: 'homepage' });
    setSubscribed(true);
    setEmail('');
  };

  const curatedEdit = homepage?.curatedEdit || [];
  const newArrivals = homepage?.newArrivals || [];
  const trending = homepage?.trending || [];

  return (
    <div>
      {/* Fullscreen cinematic hero — Section 8 */}
      <section className="relative h-screen min-h-[560px] flex items-end">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600"
          alt="Maison Verrier"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inkDeep via-inkDeep/40 to-inkDeep/10" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-24 w-full">
          <p className="eyebrow mb-4">Volume VII — The Showcase Demo</p>
          <h1 className="display-hero text-5xl sm:text-6xl md:text-8xl max-w-3xl">The next generation of shopping, curated by AI.</h1>
          <p className="mt-6 text-ash max-w-md">Conversational discovery. Cinematic storytelling. An atelier of pieces made to be lived in, not just owned.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-gold">Enter the Boutique</Link>
            <Link to="/vip" className="btn-ghost">VIP Membership</Link>
          </div>
        </div>
      </section>

      {/* Trust bar — grounded industry outlook, sourced */}
      <section className="border-b border-white/10 bg-ink/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRUST_STATS.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="font-display text-3xl text-gold mb-1">{s.value}</p>
              <p className="text-xs text-ash leading-relaxed">{s.label}</p>
              <p className="text-[10px] text-ash/50 uppercase tracking-widest2 mt-1">{s.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Curated Edit */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="eyebrow mb-3">Curated by intelligence</p>
            <h2 className="font-display text-3xl md:text-4xl">The AI-Curated Edit</h2>
          </div>
          <Link to="/shop?curated=1" className="text-xs tracking-widest2 uppercase text-gold hover:text-goldSoft whitespace-nowrap">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {homepage ? curatedEdit.map((p) => <ProductCard key={p.id} product={p} />) : Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </section>

      {/* Trending — real, driven by actual view counts */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 border-t border-white/5">
          <p className="eyebrow mb-3">What everyone's looking at</p>
          <h2 className="font-display text-3xl md:text-4xl mb-12">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Storytelling scroll section — heritage narrative */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
        <p className="eyebrow mb-4">Provenance</p>
        <p className="font-display text-2xl md:text-4xl leading-relaxed">
          Every piece in this atelier carries a lineage — of ateliers, of hands, of decades spent
          perfecting a single craft. Our AI doesn't replace that story. It simply helps you find it faster.
        </p>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <p className="eyebrow mb-3">Recently arrived</p>
        <h2 className="font-display text-3xl md:text-4xl mb-12">New to the Atelier</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {homepage ? newArrivals.map((p) => <ProductCard key={p.id} product={p} />) : Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </section>

      {/* Recently viewed — real, from localStorage */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 border-t border-white/5">
          <p className="eyebrow mb-3">Continue where you left off</p>
          <h2 className="font-display text-3xl md:text-4xl mb-12">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {recentlyViewed.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="border-y border-white/10 bg-ink/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <p className="eyebrow mb-3 text-center">In their words</p>
          <h2 className="font-display text-3xl md:text-4xl mb-16 text-center">What Members Say</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}>
                <p className="text-gold text-2xl mb-4 font-display">"</p>
                <p className="text-sm text-ash leading-relaxed mb-6">{t.quote}</p>
                <p className="text-xs uppercase tracking-widest2">{t.name}</p>
                <p className="text-[11px] text-ash/60">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP banner */}
      <section>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-24 text-center">
          <p className="eyebrow mb-4">Belong</p>
          <h2 className="font-display text-3xl md:text-4xl mb-6">VIP Membership</h2>
          <p className="text-ash max-w-xl mx-auto mb-8">Exclusive access, a dedicated stylist, and white-glove delivery — reserved for those who value more than a transaction.</p>
          <Link to="/vip" className="btn-gold">Discover VIP</Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-white/10">
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-20 text-center">
          <p className="eyebrow mb-4">Stay informed</p>
          <h2 className="font-display text-3xl mb-6">Early access to new arrivals</h2>
          {subscribed ? (
            <p className="text-gold text-sm">You're on the list — thank you.</p>
          ) : (
            <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 sm:w-72 bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 px-1 placeholder:text-ash/60 text-center sm:text-left"
              />
              <button type="submit" className="btn-gold">Subscribe</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
