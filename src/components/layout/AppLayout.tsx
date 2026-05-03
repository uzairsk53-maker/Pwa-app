import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { useOnlineStatus } from '@/hooks';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const isOnline = useOnlineStatus();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 max-w-[480px] mx-auto">
      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <WifiOff size={16} />
            You're offline. Showing cached data.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
