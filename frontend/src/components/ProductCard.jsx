import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const finalPrice = Number(product.pricing?.finalPrice ?? product.basePrice);
  const basePrice = Number(product.basePrice);
  const adjusted = product.pricing && product.pricing.adjustmentPercent !== 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const trending = product.viewCount > 15;

  return (
    <Link to={`/product/${product.slug}`} className="group block fade-slow">
      <div className="aspect-[4/5] overflow-hidden bg-ink relative">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms] ease-out"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
          {product.isLimitedEdition && <span className="eyebrow bg-inkDeep/80 px-3 py-1">Limited Edition</span>}
          {trending && <span className="text-[10px] uppercase tracking-widest2 bg-gold text-inkDeep px-3 py-1 font-medium">🔥 Trending</span>}
        </div>
        {product.stock === 0 ? (
          <div className="absolute inset-0 bg-inkDeep/70 flex items-center justify-center">
            <span className="eyebrow">Sold Out</span>
          </div>
        ) : lowStock && (
          <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest2 text-red-300 bg-inkDeep/80 px-3 py-1">Only {product.stock} left</span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="eyebrow">{product.brand}</p>
        <h3 className="font-display text-xl group-hover:text-gold transition-colors">{product.name}</h3>
        <p className="text-gold text-sm">
          ${finalPrice.toLocaleString()}
          {adjusted && <span className="text-ash line-through ml-2 text-xs">${basePrice.toLocaleString()}</span>}
        </p>
      </div>
    </Link>
  );
}
