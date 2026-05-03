import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, Calendar } from 'lucide-react';
import { orderApi } from '@/services/orderApi';
import { STALE_TIMES, ORDER_STATUS_CONFIG, PAYMENT_TYPE_LABELS } from '@/constants';
import { OrderCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, getTimeAgo, getProductPrimaryImage } from '@/utils';
import type { OrderStatus } from '@/types';

const STATUS_TABS: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, status: activeTab === 'ALL' ? undefined : activeTab }],
    queryFn: () =>
      orderApi.getOrders({
        page,
        limit: 20,
        status: activeTab === 'ALL' ? undefined : activeTab,
      }),
    staleTime: STALE_TIMES.ORDERS,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 pt-12 pb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : data?.orders && data.orders.length > 0 ? (
          <AnimatePresence>
            {data.orders.map((order, i) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING;
              return (
                <motion.button
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <span
                      className="text-[11px] font-semibold px-3 py-1 rounded-full"
                      style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Product thumbnails */}
                  <div className="flex gap-2 mb-3">
                    {order.products?.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden"
                      >
                        {(() => {
                          const imgUrl = item.product ? getProductPrimaryImage(item.product) : null;
                          return imgUrl ? (
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          );
                        })()}
                      </div>
                    ))}
                    {(order.products?.length || 0) > 4 && (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">+{(order.products?.length || 0) - 4}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {getTimeAgo(order.createdAt)}
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {PAYMENT_TYPE_LABELS[order.paymentType]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        ) : (
          <EmptyState
            icon="orders"
            title="No orders found"
            description={activeTab !== 'ALL' ? `No ${activeTab.toLowerCase()} orders` : 'You haven\'t placed any orders yet'}
            action={{ label: 'Shop Now', onClick: () => navigate('/products') }}
          />
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium disabled:opacity-40 shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">{page} / {data.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-40 shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
