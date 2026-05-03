import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, ClipboardList, Wallet, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/products', icon: ShoppingBag, label: 'Products' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/wallet', icon: Wallet, label: 'Credit' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[56px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-12 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon
                size={22}
                className={`transition-colors duration-200 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
