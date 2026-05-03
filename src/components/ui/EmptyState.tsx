import { motion } from 'framer-motion';
import { ShoppingBag, WifiOff, AlertTriangle, Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'cart' | 'offline' | 'error' | 'search' | 'orders';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  cart: ShoppingBag,
  offline: WifiOff,
  error: AlertTriangle,
  search: Search,
  orders: ShoppingBag,
};

export function EmptyState({ icon = 'cart', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
        <Icon size={36} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
