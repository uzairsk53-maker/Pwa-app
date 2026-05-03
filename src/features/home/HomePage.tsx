import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  Zap,
  RefreshCw,
  CreditCard,
  Star,
} from 'lucide-react';
import { shopkeeperApi } from '@/services/shopkeeperApi';
import { orderApi } from '@/services/orderApi';
import { STALE_TIMES } from '@/constants';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, getTimeAgo } from '@/utils';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.getItemCount());

  const {
    data: dashboard,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: shopkeeperApi.getDashboard,
    staleTime: STALE_TIMES.DASHBOARD,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['orders', { page: 1, limit: 5 }],
    queryFn: () => orderApi.getOrders({ page: 1, limit: 5 }),
    staleTime: STALE_TIMES.ORDERS,
  });

  if (isLoading) return <DashboardSkeleton />;

  const profile = dashboard?.profile;
  const credit = dashboard?.creditSummary;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-emerald-100 text-sm">Welcome back,</p>
              <h1 className="text-xl font-bold text-white">{profile?.ownerName || 'Shopkeeper'}</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center"
              >
                <RefreshCw size={18} className={`text-white ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center relative"
              >
                <ShoppingBag size={18} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Shop Name badge */}
          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 inline-flex items-center gap-2">
            <Star size={14} className="text-amber-300" />
            <span className="text-white text-sm font-medium">{profile?.shopName}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-14 relative z-10 space-y-4 pb-4">
        {/* Credit Card */}
        <motion.div
          {...fadeUp}
          className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg shadow-gray-200/50 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <Wallet size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Credit Points</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {credit?.points ?? 0}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/wallet')}
              className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700"
            >
              View <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Credit Score</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {credit?.score?.toLocaleString() ?? 0}
              </p>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cash Equivalent</p>
              <p className="text-lg font-bold text-teal-700 dark:text-teal-400">
                {formatCurrency(credit?.points ?? 0)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
          {[
            { icon: ShoppingBag, label: 'Shop Now', color: 'from-blue-500 to-indigo-600', path: '/products' },
            { icon: CreditCard, label: 'My Orders', color: 'from-purple-500 to-pink-600', path: '/orders' },
            { icon: TrendingUp, label: 'Credit', color: 'from-amber-500 to-orange-600', path: '/wallet' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon size={20} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Fast Delivery Banner */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-orange-200/50"
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
            <Zap size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base">Fast Delivery</h3>
            <p className="text-white/80 text-xs">Get your orders delivered in 30 minutes!</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Order
          </button>
        </motion.div>

        {/* Recent Orders */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-emerald-600 font-semibold flex items-center gap-1"
            >
              See All <ChevronRight size={14} />
            </button>
          </div>

          {recentOrders?.orders && recentOrders.orders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getTimeAgo(order.createdAt)} · {order.products?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        color: order.status === 'DELIVERED' ? '#10b981' : order.status === 'PENDING' ? '#f59e0b' : '#3b82f6',
                        backgroundColor: order.status === 'DELIVERED' ? 'rgba(16,185,129,0.1)' : order.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
              <ShoppingBag size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No orders yet</p>
              <button
                onClick={() => navigate('/products')}
                className="text-emerald-600 text-sm font-semibold mt-2"
              >
                Start Shopping
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
