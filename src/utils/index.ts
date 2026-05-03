export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getTimeAgo(date: string): string {
  const now = new Date().getTime();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function truncate(str: string, length: number = 30): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getOrderStatusStep(status: string): number {
  const steps: Record<string, number> = {
    PENDING: 0,
    APPROVED: 1,
    PACKED: 2,
    SHIPPED: 3,
    DELIVERED: 4,
  };
  return steps[status] ?? 0;
}

export function creditPointsToRupees(points: number): number {
  return points; // 1 credit point = ₹1
}

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Image Resolution ────────────────────────────────────────────────────────
// Backend base URL — images are served at http://localhost:5000/uploads/...
const BACKEND_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace('/api/v1', '') ??
  'http://localhost:5000';

/**
 * Resolve a raw image path from the backend into a fully-qualified URL.
 * - /uploads/file.jpg  → http://localhost:5000/uploads/file.jpg
 * - https://...        → returned as-is
 * - null/empty         → null
 */
export function resolveImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${BACKEND_BASE}${path}`;
}

/**
 * Get all resolved image URLs for a product.
 * Uses flat images[] first (normalized by backend service),
 * falls back to productImages[] relation if images[] is empty.
 */
export function getProductImages(product: {
  images?: string[];
  productImages?: { url: string; sortOrder: number }[];
}): string[] {
  const flat = (product.images || []).filter(Boolean);
  if (flat.length > 0) {
    return flat.map(resolveImageUrl).filter(Boolean) as string[];
  }
  const relational = (product.productImages || [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(img => resolveImageUrl(img.url))
    .filter(Boolean) as string[];
  return relational;
}

/**
 * Get the primary (first) resolved image URL for a product, or null.
 */
export function getProductPrimaryImage(product: {
  images?: string[];
  productImages?: { url: string; sortOrder: number }[];
}): string | null {
  return getProductImages(product)[0] ?? null;
}
