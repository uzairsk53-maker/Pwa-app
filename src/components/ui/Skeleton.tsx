import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height, variant = 'rectangular' }: SkeletonProps) {
  const baseClass = 'bg-gray-200 dark:bg-gray-700 overflow-hidden relative';
  const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-xl';

  return (
    <motion.div
      className={`${baseClass} ${variantClass} ${className}`}
      style={{ width, height }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 space-y-3">
      <Skeleton height={140} className="w-full rounded-xl" />
      <Skeleton height={14} width="80%" className="rounded" />
      <Skeleton height={12} width="50%" className="rounded" />
      <div className="flex justify-between items-center">
        <Skeleton height={16} width="40%" className="rounded" />
        <Skeleton height={32} width={32} variant="circular" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton height={14} width="40%" className="rounded" />
        <Skeleton height={24} width={80} className="rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton height={48} width={48} className="rounded-lg" />
        <Skeleton height={48} width={48} className="rounded-lg" />
        <Skeleton height={48} width={48} className="rounded-lg" />
      </div>
      <div className="flex justify-between">
        <Skeleton height={14} width="30%" className="rounded" />
        <Skeleton height={14} width="25%" className="rounded" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton height={120} className="w-full rounded-2xl" />
      <Skeleton height={80} className="w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton height={100} className="rounded-2xl" />
        <Skeleton height={100} className="rounded-2xl" />
      </div>
      <Skeleton height={160} className="w-full rounded-2xl" />
    </div>
  );
}
