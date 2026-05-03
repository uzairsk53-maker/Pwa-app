import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Download,
  AlertCircle,
} from 'lucide-react';
import { orderApi } from '@/services/orderApi';
import { STALE_TIMES, ORDER_STATUS_CONFIG, PAYMENT_TYPE_LABELS, ORDER_TYPE_LABELS } from '@/constants';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDateTime, getOrderStatusStep, getProductPrimaryImage } from '@/utils';

const TIMELINE_STEPS = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'APPROVED', label: 'Approved', icon: CheckCircle2 },
  { status: 'PACKED', label: 'Packed', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrderById(id!),
    enabled: !!id,
    staleTime: STALE_TIMES.ORDERS,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!order) return null;

  const currentStep = getOrderStatusStep(order.status);
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 pt-12 pb-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 dark:text-white">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ color: statusConfig?.color, backgroundColor: statusConfig?.bg }}
        >
          {statusConfig?.label}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Order Tracking</h3>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, i) => {
              const isCompleted = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <step.icon
                        size={14}
                        className={isCompleted ? 'text-white' : 'text-gray-400'}
                      />
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          i < currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-emerald-600 mt-0.5">Current status</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Items ({order.products?.length || 0})
          </h3>
          <div className="space-y-3">
            {order.products?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(() => {
                    const imgUrl = item.product ? getProductPrimaryImage(item.product) : null;
                    return imgUrl ? (
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-gray-400" />
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.product?.name || 'Product'}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(Number(item.priceAtOrder) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Type</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {PAYMENT_TYPE_LABELS[order.paymentType]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order Type</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ORDER_TYPE_LABELS[order.orderType]}
              </span>
            </div>
            {Number(order.creditUsed) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Credit Used</span>
                <span className="font-medium">{formatCurrency(order.creditUsed)}</span>
              </div>
            )}
            {Number(order.cashAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Cash Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.cashAmount)}</span>
              </div>
            )}
            {order.repaymentDeadline && (
              <div className="flex justify-between text-amber-600">
                <span>Repayment Deadline</span>
                <span className="font-medium">{formatDateTime(order.repaymentDeadline)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Delivery Info */}
        {order.deliveryBoy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5"
          >
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Delivery Info</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Partner</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone size={12} />
                  {order.deliveryBoy.phone}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <button
            className="w-full py-3 bg-white dark:bg-gray-800 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 shadow-sm"
          >
            <AlertCircle size={16} />
            Raise Issue
          </button>
        </motion.div>
      </div>
    </div>
  );
}
