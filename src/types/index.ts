// ============ API Response ============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

// ============ Auth ============
export interface LoginRequest {
  phone: string;
  password: string;
  role: 'SHOPKEEPER' | 'ADMIN' | 'DELIVERY';
}

export interface RegisterRequest {
  phone: string;
  password: string;
  shopName: string;
  ownerName: string;
  address: string;
  city: string;
}

export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'SHOPKEEPER' | 'DELIVERY';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ============ Shopkeeper ============
export interface Shopkeeper {
  id: string;
  userId: string;
  shopName: string;
  ownerName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  creditScore: number;
  creditPoints: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string | null;
    phone: string;
  };
}

export interface UpdateProfileRequest {
  shopName?: string;
  ownerName?: string;
  address?: string;
  city?: string;
  email?: string;
}

// ============ Dashboard ============
export interface DashboardData {
  profile: Shopkeeper;
  creditSummary: {
    score: number;
    points: number;
  };
}

// ============ Product ============
export interface ProductImage {
  id: string;
  productId: string;
  url: string;          // relative path e.g. /uploads/filename.jpg
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price: number | string;
  bulkPrice: number | string | null;
  creditPrice?: number | string | null;
  stock: number;
  images: string[];              // flat URL array (normalized by backend service)
  productImages?: ProductImage[]; // relational array (kept for admin use)
  fastDeliveryEligible?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

// ============ Order ============
export type OrderType = 'NORMAL' | 'BULK' | 'FAST_DELIVERY';
export type PaymentType = 'CASH' | 'CREDIT' | 'HYBRID';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'PACKED' | 'SHIPPED' | 'DELIVERED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtOrder: number;
  product?: Product;
}

export interface Order {
  id: string;
  shopkeeperId: string;
  deliveryBoyId: string | null;
  totalAmount: number;
  orderType: OrderType;
  creditUsed: number;
  cashAmount: number;
  paymentType: PaymentType;
  status: OrderStatus;
  expectedDelivery: string;
  repaymentDeadline: string | null;
  createdAt: string;
  updatedAt: string;
  shopkeeper?: Shopkeeper & { user?: { phone: string; email: string | null } };
  deliveryBoy?: { phone: string; email: string | null } | null;
  products?: OrderItem[];
  deliveryAssignments?: {
    deliveryBoy?: {
      id: string;
      name: string;
      phone: string;
      latitude: string | number | null;
      longitude: string | number | null;
    };
  }[];
}

export interface OrderListResponse {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface CreateOrderRequest {
  products: {
    productId: string;
    quantity: number;
    priceAtOrder: number;
  }[];
  orderType: OrderType;
  totalAmount: number;
  creditUsed: number;
  cashAmount: number;
  paymentType: PaymentType;
  expectedDelivery: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  date?: string;
}

// ============ Credit ============
export interface CreditTransaction {
  id: string;
  shopkeeperId: string;
  orderId: string | null;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  dueDate: string | null;
  status: 'CLEARED' | 'PENDING' | 'OVERDUE';
  isPenalty: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ Cart ============
export interface CartItem {
  product: Product;
  quantity: number;
}
