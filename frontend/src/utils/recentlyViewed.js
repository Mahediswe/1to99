const KEY = 'lxc_recently_viewed';
const MAX = 8;

export function recordView(product) {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
    const entry = { id: product.id, slug: product.slug, name: product.name, brand: product.brand, images: product.images, basePrice: product.basePrice, pricing: product.pricing };
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [entry, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch { /* ignore storage errors */ }
}

export function getRecentlyViewed(excludeId) {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || '[]');
    return excludeId ? items.filter((p) => p.id !== excludeId) : items;
  } catch {
    return [];
  }
}
