export const APP_NAME = 'Shop Credit';

export const STALE_TIMES = {
  DASHBOARD: 2 * 60 * 1000,       // 2 minutes
  PRODUCTS: 5 * 60 * 1000,        // 5 minutes
  CATEGORIES: 15 * 60 * 1000,     // 15 minutes
  ORDERS: 1 * 60 * 1000,          // 1 minute
  CREDIT_WALLET: 30 * 1000,       // 30 seconds
  PROFILE: 10 * 60 * 1000,        // 10 minutes
} as const;

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  APPROVED: { label: 'Approved', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  PACKED: { label: 'Packed', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  SHIPPED: { label: 'Shipped', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  DELIVERED: { label: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  CREDIT: 'Credit',
  HYBRID: 'Mixed',
};

export const ORDER_TYPE_LABELS: Record<string, string> = {
  NORMAL: 'Normal',
  BULK: 'Bulk',
  FAST_DELIVERY: 'Fast Delivery',
};

export const CATEGORIES = [
  'All',
  'Dairy',
  'Beverages',
  'Snacks',
  'Grains',
  'Spices',
  'Personal Care',
  'Household',
  'Frozen',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Meat',
  'Oils',
  'Canned',
  'Others',
] as const;
