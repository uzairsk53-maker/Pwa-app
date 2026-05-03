import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Minus, Package, CreditCard, Banknote, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { shopkeeperApi } from '@/services/shopkeeperApi';
import { orderApi } from '@/services/orderApi';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, getProductPrimaryImage } from '@/utils';
import { STALE_TIMES } from '@/constants';
import type { PaymentType, OrderType } from '@/types';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [paymentType, setPaymentType] = useState<PaymentType>('CASH');
  const [orderType, setOrderType] = useState<OrderType>('NORMAL');
  const [showConfirm, setShowConfirm] = useState(false);
  const [creditUsed, setCreditUsed] = useState(0);

  const total = getTotal();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: shopkeeperApi.getDashboard,
    staleTime: STALE_TIMES.DASHBOARD,
  });

  const availablePoints = dashboard?.creditSummary?.points ?? 0;

  const createOrderMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`, { replace: true });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to place order');
    },
  });

  const handlePlaceOrder = () => {
    const cashAmount = paymentType === 'CREDIT' ? 0 : total - creditUsed;
    const orderData = {
      products: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtOrder: Number(item.product.price),
      })),
      orderType,
      totalAmount: total,
      creditUsed: paymentType === 'CASH' ? 0 : creditUsed,
      cashAmount: paymentType === 'CREDIT' ? 0 : cashAmount,
      paymentType,
      expectedDelivery: new Date(
        Date.now() + (orderType === 'FAST_DELIVERY' ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000)
      ).toISOString(),
    };
    createOrderMutation.mutate(orderData);
    setShowConfirm(false);
  };

  const handlePaymentTypeChange = (type: PaymentType) => {
    setPaymentType(type);
    if (type === 'CASH') {
      setCreditUsed(0);
    } else if (type === 'CREDIT') {
      setCreditUsed(Math.min(availablePoints, total));
    } else {
      setCreditUsed(Math.min(availablePoints, Math.floor(total / 2)));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 pt-12 pb-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Cart</h1>
        </div>
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          description="Browse products and add items to your cart"
          action={{ label: 'Browse Products', onClick: () => navigate('/products') }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-12 pb-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Cart</h1>
            <p className="text-xs text-gray-500">{items.length} items</p>
          </div>
        </div>
        <button onClick={clearCart} className="text-xs text-red-500 font-semibold">Clear All</button>
      </div>

      <div className="px-4 py-4 pb-60 space-y-4">
        {/* Cart Items */}
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              exit={{ opacity: 0, x: -100 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-4 shadow-sm"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {(() => {
                  const imgUrl = getProductPrimaryImage(item.product);
                  return imgUrl ? (
                    <img src={imgUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={24} className="text-gray-400" />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {item.product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{item.product.category}</p>
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {formatCurrency(Number(item.product.price) * item.quantity)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? removeItem(item.product.id)
                          : updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center active:scale-90"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={14} className="text-red-500" />
                      ) : (
                        <Minus size={14} className="text-gray-600" />
                      )}
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center active:scale-90"
                    >
                      <Plus size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Order Type */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Delivery Type</h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { type: 'NORMAL' as const, label: 'Normal', icon: Package, desc: '24 hrs' },
              { type: 'BULK' as const, label: 'Bulk', icon: Package, desc: '2-3 days' },
              { type: 'FAST_DELIVERY' as const, label: 'Fast', icon: Zap, desc: '30 mins' },
            ]).map((opt) => (
              <button
                key={opt.type}
                onClick={() => setOrderType(opt.type)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  orderType === opt.type
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <opt.icon size={18} className={`mx-auto mb-1 ${orderType === opt.type ? 'text-emerald-600' : 'text-gray-400'}`} />
                <p className={`text-xs font-semibold ${orderType === opt.type ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Type */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Payment Method</h3>
          <div className="space-y-2">
            {([
              { type: 'CASH' as const, label: 'Cash', icon: Banknote, desc: 'Pay in cash on delivery' },
              { type: 'CREDIT' as const, label: 'Credit Points', icon: CreditCard, desc: `Available: ${availablePoints} pts` },
              { type: 'HYBRID' as const, label: 'Mixed Payment', icon: CreditCard, desc: 'Use partial credit + cash' },
            ]).map((opt) => (
              <button
                key={opt.type}
                onClick={() => handlePaymentTypeChange(opt.type)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                  paymentType === opt.type
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentType === opt.type ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <opt.icon size={18} className={paymentType === opt.type ? 'text-white' : 'text-gray-500'} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${paymentType === opt.type ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentType === opt.type ? 'border-emerald-500' : 'border-gray-300'
                }`}>
                  {paymentType === opt.type && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                </div>
              </button>
            ))}
          </div>

          {/* Credit points input for HYBRID */}
          {paymentType === 'HYBRID' && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-2">
                Credit Points to Use (max: {Math.min(availablePoints, total)})
              </label>
              <input
                type="number"
                value={creditUsed}
                onChange={(e) => setCreditUsed(Math.min(availablePoints, total, Number(e.target.value)))}
                min={0}
                max={Math.min(availablePoints, total)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Fixed Bill Summary */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 px-5 py-4 safe-area-bottom">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(total)}</span>
          </div>
          {(paymentType === 'CREDIT' || paymentType === 'HYBRID') && creditUsed > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">Credit Points Used</span>
              <span className="text-emerald-600 font-medium">-{formatCurrency(creditUsed)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
            <span className="text-gray-900 dark:text-white">To Pay</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(paymentType === 'CREDIT' ? 0 : total - creditUsed)}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (paymentType !== 'CASH' && creditUsed > availablePoints) {
              toast.error('Insufficient credit points');
              return;
            }
            setShowConfirm(true);
          }}
          disabled={createOrderMutation.isPending}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {createOrderMutation.isPending ? 'Placing Order...' : `Place Order · ${formatCurrency(total)}`}
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handlePlaceOrder}
        title="Confirm Order"
        message={`You are about to place an order for ${formatCurrency(total)}. Payment method: ${paymentType}. Continue?`}
        confirmText="Place Order"
        loading={createOrderMutation.isPending}
      />
    </div>
  );
}
