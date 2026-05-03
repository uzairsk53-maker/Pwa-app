import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Shield,
  Star,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { shopkeeperApi } from '@/services/shopkeeperApi';
import { orderApi } from '@/services/orderApi';
import { STALE_TIMES } from '@/constants';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/utils';

export default function WalletPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: shopkeeperApi.getDashboard,
    staleTime: STALE_TIMES.CREDIT_WALLET,
  });

  const { data: creditOrders } = useQuery({
    queryKey: ['orders', { page: 1, limit: 10 }],
    queryFn: () => orderApi.getOrders({ page: 1, limit: 10 }),
    staleTime: STALE_TIMES.ORDERS,
  });

  if (isLoading) return <DashboardSkeleton />;

  const credit = dashboard?.creditSummary;
  const profile = dashboard?.profile;

  // Derive credit history from orders that used credit
  const creditTransactions = creditOrders?.orders
    ?.filter((o) => Number(o.creditUsed) > 0)
    .map((o) => ({
      id: o.id,
      type: 'DEBIT' as const,
      amount: Number(o.creditUsed),
      date: o.createdAt,
      description: `Order #${o.id.slice(-8).toUpperCase()}`,
    })) || [];

  const scorePercentage = Math.min(((credit?.score ?? 0) / 50000) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-bold text-white mb-6">Credit Wallet</h1>

          <div className="text-center mb-4">
            <p className="text-purple-200 text-sm mb-1">Available Credit Points</p>
            <p className="text-5xl font-extrabold text-white">{credit?.points ?? 0}</p>
            <p className="text-purple-200 text-sm mt-1">
              ≈ {formatCurrency(credit?.points ?? 0)} cash value
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-14 relative z-10 space-y-4 pb-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Credit Score</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {credit?.score?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Max: 50,000</p>
            </div>
          </div>
          {/* Score Bar */}
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scorePercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            10,000 score = 100 credit points · Higher score unlocks more credit
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4"
          >
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points Earned</p>
            <p className="text-lg font-bold text-emerald-600">{credit?.points ?? 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
              <CreditCard size={16} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points Used</p>
            <p className="text-lg font-bold text-blue-600">
              {creditTransactions.reduce((acc, t) => acc + t.amount, 0)}
            </p>
          </motion.div>
        </div>

        {/* Credit Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Star size={14} className="text-amber-500" />
            How Credit Works
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
            <li>• 10,000 system score = 100 credit points</li>
            <li>• On-time repayment: +5% bonus points & +10 score</li>
            <li>• Late repayment: -2% penalty & -50 score</li>
            <li>• Use credit points to pay for orders partially or fully</li>
            <li>• Maintain high score for better credit limits</li>
          </ul>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Recent Credit Usage
          </h3>
          {creditTransactions.length > 0 ? (
            <div className="space-y-2">
              {creditTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'DEBIT' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                  }`}>
                    {tx.type === 'DEBIT' ? (
                      <ArrowDownRight size={18} className="text-red-600" />
                    ) : (
                      <ArrowUpRight size={18} className="text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(tx.date)}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${tx.type === 'DEBIT' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {tx.type === 'DEBIT' ? '-' : '+'}{tx.amount} pts
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
              <Wallet size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No credit transactions yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
