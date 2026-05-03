import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';

// Lazy loaded pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const HomePage = lazy(() => import('@/features/home/HomePage'));
const ProductsPage = lazy(() => import('@/features/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/features/products/ProductDetailPage'));
const CartPage = lazy(() => import('@/features/cart/CartPage'));
const OrdersPage = lazy(() => import('@/features/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/OrderDetailPage'));
const WalletPage = lazy(() => import('@/features/credit-wallet/WalletPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));

// Loading spinner for lazy pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// Public route (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><RegisterPage /></PublicRoute>,
  },
  // Protected routes with layout
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
      { path: 'products', element: <Suspense fallback={<PageLoader />}><ProductsPage /></Suspense> },
      { path: 'orders', element: <Suspense fallback={<PageLoader />}><OrdersPage /></Suspense> },
      { path: 'wallet', element: <Suspense fallback={<PageLoader />}><WalletPage /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
    ],
  },
  // Detail pages (no bottom nav)
  {
    path: '/products/:id',
    element: <ProtectedRoute><ProductDetailPage /></ProtectedRoute>,
  },
  {
    path: '/cart',
    element: <ProtectedRoute><CartPage /></ProtectedRoute>,
  },
  {
    path: '/orders/:id',
    element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute>,
  },
  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
