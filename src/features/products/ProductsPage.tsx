import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { productApi } from '@/services/productApi';
import { STALE_TIMES, CATEGORIES } from '@/constants';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useDebounce } from '@/hooks';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency, getProductPrimaryImage } from '@/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { addItem, items, updateQuantity, removeItem } = useCartStore();
  const cartCount = useCartStore((s) => s.getItemCount());

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { page, search: debouncedSearch, category: selectedCategory }],
    queryFn: () =>
      productApi.getProducts({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      }),
    staleTime: STALE_TIMES.PRODUCTS,
    placeholderData: (prev) => prev,
  });

  const getCartQuantity = useCallback(
    (productId: string) => {
      const item = items.find((i) => i.product.id === productId);
      return item?.quantity || 0;
    },
    [items]
  );

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`, {
      duration: 1500,
      style: { fontSize: '13px', borderRadius: '12px' },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 pt-12 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Products</h1>
            <button
              onClick={() => navigate('/cart')}
              className="relative w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center"
            >
              <ShoppingCart size={20} className="text-emerald-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"
            >
              <SlidersHorizontal size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Category Scroll */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : data?.products && data.products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {data.products.map((product, i) => {
                  const qty = getCartQuantity(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => navigate(`/products/${product.id}`, { state: { product } })}
                        className="w-full text-left"
                      >
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 p-2 flex items-center justify-center relative overflow-hidden">
                          {(() => {
                            const imgUrl = getProductPrimaryImage(product);
                            return imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  (e.currentTarget.nextSibling as HTMLElement)?.removeAttribute('hidden');
                                }}
                              />
                            ) : null;
                          })()}
                          {!getProductPrimaryImage(product) && (
                            <Package size={40} className="text-gray-300 dark:text-gray-600" />
                          )}
                          {product.stock <= 5 && product.stock > 0 && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              Low Stock
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <div className="p-3 pb-2">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">
                            {product.category}
                          </p>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {product.name}
                          </h3>
                        </div>
                      </button>
                      <div className="px-3 pb-3 flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.price)}
                          </p>
                          {product.bulkPrice && (
                            <p className="text-[10px] text-gray-400">
                              Bulk: {formatCurrency(product.bulkPrice)}
                            </p>
                          )}
                        </div>
                        {product.stock > 0 && (
                          <>
                            {qty === 0 ? (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 active:scale-90 transition-transform"
                              >
                                <Plus size={18} className="text-white" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    qty === 1 ? removeItem(product.id) : updateQuantity(product.id, qty - 1)
                                  }
                                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                                >
                                  <Minus size={14} className="text-gray-600 dark:text-gray-300" />
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => updateQuantity(product.id, qty + 1)}
                                  className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                                >
                                  <Plus size={14} className="text-white" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 shadow-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-40 shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="search"
            title="No products found"
            description={searchQuery ? `No results for "${searchQuery}"` : 'No products available right now'}
            action={{ label: 'Clear Filters', onClick: () => { setSearchQuery(''); setSelectedCategory('All'); } }}
          />
        )}
      </div>

      {/* Filters Bottom Sheet */}
      <BottomSheet isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filters">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowFilters(false)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl"
          >
            Apply Filters
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
