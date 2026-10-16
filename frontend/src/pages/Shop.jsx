import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import { useToast } from '../context/ToastContext.jsx';

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

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Shop() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // null | 'listening' | 'photo'
  const [photoDescription, setPhotoDescription] = useState('');
  const [note, setNote] = useState('');
  const [semanticMode, setSemanticMode] = useState(false);
  const curated = params.get('curated');
  const recognitionRef = useRef(null);
  const { showToast } = useToast();

  // Filters
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sort, setSort] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    client.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    setSemanticMode(false);
    setNote('');
    if (curated) {
      const { data } = await client.get('/products/homepage');
      setProducts(data.curatedEdit);
      setLoading(false);
      return;
    }
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (maxPrice < 25000) q.set('maxPrice', maxPrice);
    if (sort) q.set('sort', sort);
    if (inStockOnly) q.set('inStockOnly', 'true');
    const { data } = await client.get(`/products?${q.toString()}`);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { loadCatalog(); }, [curated, category, maxPrice, sort, inStockOnly]);

  const runSemanticSearch = async (q) => {
    setLoading(true);
    setNote('');
    setSemanticMode(true);
    const { data } = await client.post('/search/semantic', { query: q });
    setProducts(data);
    setLoading(false);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice search isn\'t supported in this browser — try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setLoading(true);
      setSemanticMode(true);
      const { data } = await client.post('/search/voice', { transcript });
      setProducts(data.products);
      setLoading(false);
      setMode(null);
    };
    recognition.onerror = () => setMode(null);
    recognition.onend = () => setMode((m) => (m === 'listening' ? null : m));
    recognitionRef.current = recognition;
    setMode('listening');
    recognition.start();
  };

  const runPhotoSearch = async (e) => {
    e.preventDefault();
    if (!photoDescription.trim()) return;
    setLoading(true);
    setSemanticMode(true);
    const { data } = await client.post('/search/image', { description: photoDescription });
    setProducts(data.products);
    setNote(data.note);
    setLoading(false);
    setMode(null);
  };

  const resetFilters = () => {
    setCategory(''); setMaxPrice(25000); setSort(''); setInStockOnly(false); setQuery('');
    if (semanticMode) loadCatalog();
  };

  const activeFilterCount = [category, maxPrice < 25000, inStockOnly].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-28">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="eyebrow mb-3">{curated ? 'AI-curated selection' : 'The full atelier'}</p>
          <h1 className="font-display text-4xl md:text-5xl">{curated ? 'The Curated Edit' : 'Shop'}</h1>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); if (query.trim()) runSemanticSearch(query); }}
            className="flex items-center gap-2 flex-1 md:w-80"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for…"
              className="flex-1 bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60"
            />
            <button type="submit" className="text-xs tracking-widest2 uppercase text-gold hover:text-goldSoft whitespace-nowrap">Search</button>
          </form>
          <button
            onClick={startVoiceSearch}
            title="Voice search"
            className={`w-9 h-9 flex items-center justify-center border rounded-full shrink-0 ${mode === 'listening' ? 'border-gold text-gold animate-pulse' : 'border-white/20 text-ash hover:border-gold hover:text-gold'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" /><path d="M19 11a7 7 0 01-14 0M12 18v3" strokeLinecap="round" /></svg>
          </button>
          <button
            onClick={() => setMode((m) => (m === 'photo' ? null : 'photo'))}
            title="Search by photo description"
            className={`w-9 h-9 flex items-center justify-center border rounded-full shrink-0 ${mode === 'photo' ? 'border-gold text-gold' : 'border-white/20 text-ash hover:border-gold hover:text-gold'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="3.5" /></svg>
          </button>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`md:hidden w-9 h-9 flex items-center justify-center border rounded-full shrink-0 relative ${filtersOpen ? 'border-gold text-gold' : 'border-white/20 text-ash'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" /></svg>
            {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gold rounded-full text-[9px] text-inkDeep flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {mode === 'photo' && (
        <form onSubmit={runPhotoSearch} className="panel p-5 mb-10 flex flex-col sm:flex-row gap-3">
          <input
            value={photoDescription}
            onChange={(e) => setPhotoDescription(e.target.value)}
            placeholder="Describe the photo — e.g. black leather tote with gold hardware"
            className="flex-1 bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60"
          />
          <button type="submit" className="btn-ghost whitespace-nowrap">Find similar</button>
        </form>
      )}
      {note && <p className="text-xs text-ash mb-8 -mt-4">{note}</p>}
      {semanticMode && (
        <button onClick={resetFilters} className="text-xs text-gold hover:text-goldSoft uppercase tracking-widest2 mb-8 -mt-4 block">← Clear search, browse full catalog</button>
      )}

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* Filter sidebar */}
        {!curated && !semanticMode && (
          <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block space-y-8`}>
            <div>
              <p className="eyebrow mb-4">Category</p>
              <div className="space-y-2">
                <button onClick={() => setCategory('')} className={`block text-sm ${!category ? 'text-gold' : 'text-ash hover:text-parchment'}`}>All</button>
                {categories.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={`block text-sm ${category === c ? 'text-gold' : 'text-ash hover:text-parchment'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Max Price</p>
              <input
                type="range" min="500" max="25000" step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-gold"
              />
              <p className="text-xs text-ash mt-2">Up to ${maxPrice.toLocaleString()}{maxPrice === 25000 ? '+' : ''}</p>
            </div>
            <div>
              <p className="eyebrow mb-4">Sort By</p>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-inkDeep border border-white/20 text-sm px-3 py-2 focus:border-gold outline-none">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-ash cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-gold" />
              In stock only
            </label>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-xs text-gold hover:text-goldSoft uppercase tracking-widest2">Clear filters</button>
            )}
          </aside>
        )}

        <div className={curated || semanticMode ? 'md:col-span-2' : ''}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <p className="text-ash text-sm">No pieces matched — try a different description or fewer filters.</p>
          ) : (
            <>
              <p className="text-xs text-ash mb-6">{products.length} piece{products.length !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
