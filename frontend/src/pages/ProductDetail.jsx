import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { recordView } from '../utils/recentlyViewed.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [detailTab, setDetailTab] = useState('story');
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setProduct(null);
    setActiveImage(0);
    setSelectedSize(null);
    client.get(`/products/${slug}`).then(({ data }) => { setProduct(data); recordView(data); });
    client.get(`/products/${slug}/reviews`).then(({ data }) => setReviews(data));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    client.post('/search/semantic', { query: product.semanticTags.join(' '), category: product.category })
      .then(({ data }) => setRelated(data.filter((p) => p.id !== product.id).slice(0, 3)));
    if (user) {
      client.get('/me/wishlist').then(({ data }) => setWishlisted(data.some((p) => p.id === product.id)));
    }
  }, [product, user]);

  const toggleWishlist = async () => {
    if (!user) return navigate('/login');
    if (wishlisted) {
      await client.delete(`/me/wishlist/${product.id}`);
      setWishlisted(false);
      showToast('Removed from wishlist');
    } else {
      await client.post(`/me/wishlist/${product.id}`);
      setWishlisted(true);
      showToast('Saved to wishlist');
    }
  };

  const handleAddToBag = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      showToast('Please select a size first');
      return;
    }
    addItem({ ...product, selectedSize }, 1);
    showToast(`${product.name} added to your bag`);
    navigate('/cart');
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-28 grid md:grid-cols-2 gap-16">
        <div className="aspect-[4/5] skeleton" />
        <div className="space-y-4">
          <div className="h-3 w-24 skeleton" />
          <div className="h-10 w-3/4 skeleton" />
          <div className="h-6 w-32 skeleton" />
          <div className="h-24 w-full skeleton" />
        </div>
      </div>
    );
  }

  const hasDiscount = product.pricing.finalPrice < product.pricing.basePrice;
  const hasSurcharge = product.pricing.finalPrice > product.pricing.basePrice;
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900'];
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-28">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] bg-ink overflow-hidden relative group">
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            {product.isLimitedEdition && (
              <span className="absolute top-5 left-5 eyebrow bg-inkDeep/80 px-3 py-1">Limited Edition</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-20 overflow-hidden border ${activeImage === i ? 'border-gold' : 'border-white/10 opacity-60 hover:opacity-100'} transition-all`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="eyebrow">{product.brand}</p>
            {product.viewCount > 15 && <p className="text-[10px] uppercase tracking-widest2 text-gold/80">🔥 Trending</p>}
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-6">{product.name}</h1>

          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-2xl text-gold">${Number(product.pricing.finalPrice).toLocaleString()}</span>
            {(hasDiscount || hasSurcharge) && (
              <span className="text-sm text-ash line-through">${Number(product.pricing.basePrice).toLocaleString()}</span>
            )}
          </div>
          {product.pricing.adjustmentPercent !== 0 && (
            <p className="text-xs text-ash mb-4">
              {hasDiscount ? 'VIP-adjusted price' : 'Demand-adjusted price'} ({product.pricing.adjustmentPercent > 0 ? '+' : ''}{product.pricing.adjustmentPercent}%)
            </p>
          )}

          {/* Stock urgency — real, tied to actual inventory */}
          {outOfStock ? (
            <p className="text-xs text-ash uppercase tracking-widest2 mb-6">Currently Out of Stock</p>
          ) : lowStock ? (
            <p className="text-xs text-red-400/90 uppercase tracking-widest2 mb-6">Only {product.stock} left — high demand piece</p>
          ) : (
            <p className="text-xs text-ash/70 uppercase tracking-widest2 mb-6">In Stock</p>
          )}

          <p className="text-ash leading-relaxed mb-8">{product.description}</p>

          {/* Size selector */}
          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="eyebrow">Select Size</p>
                {sizeError && <p className="text-[11px] text-red-400">Please choose a size</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`min-w-[44px] h-11 px-3 text-sm border transition-colors ${selectedSize === size ? 'border-gold text-gold bg-gold/5' : 'border-white/20 text-ash hover:border-white/40'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-10">
            <button onClick={handleAddToBag} disabled={outOfStock} className="btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
              {outOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>
            <button onClick={toggleWishlist} className={`btn-ghost flex-1 ${wishlisted ? 'border-gold text-gold' : ''}`}>
              {wishlisted ? '♥ Saved' : 'Save to Wishlist'}
            </button>
          </div>

          {/* AI Review Summary — Section 11 */}
          <div className="panel p-6 mb-6">
            <p className="eyebrow mb-2">AI Review Summary</p>
            <p className="text-sm text-ash leading-relaxed">{product.aiSummary || 'No reviews yet — be the first to share your experience.'}</p>
            {product.averageRating > 0 && <p className="text-gold text-sm mt-3">{product.averageRating} / 5 average · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>}
          </div>

          {/* Detail tabs — Story / Materials & Care */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex gap-6 mb-4">
              <button onClick={() => setDetailTab('story')} className={`text-xs uppercase tracking-widest2 pb-2 border-b ${detailTab === 'story' ? 'border-gold text-gold' : 'border-transparent text-ash'}`}>Provenance</button>
              <button onClick={() => setDetailTab('materials')} className={`text-xs uppercase tracking-widest2 pb-2 border-b ${detailTab === 'materials' ? 'border-gold text-gold' : 'border-transparent text-ash'}`}>Materials &amp; Care</button>
            </div>
            {detailTab === 'story' ? (
              <p className="text-sm text-ash leading-relaxed italic">{product.story}</p>
            ) : (
              <div className="text-sm text-ash leading-relaxed space-y-2">
                {product.materials?.length > 0 && <p><span className="text-parchment">Composition: </span>{product.materials.join(', ')}</p>}
                {product.originCountry && <p><span className="text-parchment">Made in: </span>{product.originCountry}</p>}
                {product.careInstructions && <p><span className="text-parchment">Care: </span>{product.careInstructions}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Upsell / Cross-sell — Section 11 */}
      {related.length > 0 && (
        <div className="mt-28">
          <p className="eyebrow mb-3">Paired well</p>
          <h2 className="font-display text-3xl mb-10">What suits this piece</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {related.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-ink">
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <p className="mt-4 font-display text-lg">{p.name}</p>
                <p className="text-gold text-sm">${Number(p.pricing?.finalPrice ?? p.basePrice).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Individual reviews */}
      {reviews.length > 0 && (
        <div className="mt-28 max-w-2xl">
          <p className="eyebrow mb-3">In their words</p>
          <h2 className="font-display text-3xl mb-10">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-white/10 pb-6">
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= r.rating ? 'text-gold' : 'text-white/15'}>★</span>)}
                </div>
                <p className="text-sm text-ash leading-relaxed">{r.comment}</p>
                <p className="text-[11px] text-ash/60 mt-2 uppercase tracking-widest2">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ReviewForm slug={slug} onSubmitted={() => {
        client.get(`/products/${slug}`).then(({ data }) => setProduct(data));
        client.get(`/products/${slug}/reviews`).then(({ data }) => setReviews(data));
      }} />
    </div>
  );
}

function ReviewForm({ slug, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await client.post(`/products/${slug}/reviews`, { rating, comment });
    setComment('');
    setSubmitting(false);
    showToast('Thank you for your review');
    onSubmitted();
  };

  return (
    <form onSubmit={submit} className="mt-16 max-w-xl">
      <p className="eyebrow mb-3">Leave a review</p>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} className={`text-lg ${n <= rating ? 'text-gold' : 'text-ash'}`}>★</button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience…"
        rows={3}
        required
        className="w-full bg-transparent border border-white/20 focus:border-gold outline-none text-sm p-4 placeholder:text-ash/60 mb-4"
      />
      <button type="submit" disabled={submitting} className="btn-ghost">{submitting ? 'Submitting…' : 'Submit review'}</button>
    </form>
  );
}
