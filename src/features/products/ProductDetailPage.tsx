import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Minus, Zap, Package, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency, getProductImages } from '@/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const product: Product | undefined = state?.product;
  const { addItem, items, updateQuantity, removeItem } = useCartStore();
  const cartCount = useCartStore((s) => s.getItemCount());
  const [imgIndex, setImgIndex] = useState(0);

  const productImages = product ? getProductImages(product) : [];

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <p className="text-gray-500">Product not found</p>
        <button onClick={() => navigate('/products')} className="text-emerald-600 font-semibold mt-2">
          Back to Products
        </button>
      </div>
    );
  }

  const qty = items.find((i) => i.product.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (qty === 0) addItem(product, 1);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-12 pb-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-base font-bold text-gray-900 dark:text-white">Product Detail</h1>
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

      {/* Image Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mx-4 mb-4"
      >
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden flex items-center justify-center">
          {productImages.length > 0 ? (
            <img
              src={productImages[imgIndex]}
              alt={`${product.name} - image ${imgIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; }}
            />
          ) : (
            <Package size={80} className="text-gray-300" />
          )}
        </div>

        {/* Navigation arrows (only if >1 image) */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={() => setImgIndex(i => Math.max(0, i - 1))}
              disabled={imgIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center shadow disabled:opacity-30"
            >
              <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setImgIndex(i => Math.min(productImages.length - 1, i + 1))}
              disabled={imgIndex === productImages.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center shadow disabled:opacity-30"
            >
              <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {productImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === imgIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {productImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    i === imgIndex ? 'border-emerald-500' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 pb-32"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-gray-500">4.5</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{product.name}</h2>

        <div className="flex items-end gap-3 mb-4">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>
          {product.bulkPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(product.bulkPrice)}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex items-center gap-1.5 text-sm font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Zap size={14} className="text-amber-500" />
            Fast delivery available
          </div>
        </div>

        {/* Bulk Price Info */}
        {product.bulkPrice && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              💰 Bulk Price: {formatCurrency(product.bulkPrice)} per unit
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              Save more when you order in bulk quantities
            </p>
          </div>
        )}

        {/* Quantity Selector */}
        {product.stock > 0 && qty > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quantity</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => qty === 1 ? removeItem(product.id) : updateQuantity(product.id, qty - 1)}
                className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <Minus size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">{qty}</span>
              <button
                onClick={() => updateQuantity(product.id, qty + 1)}
                className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <Plus size={18} className="text-white" />
              </button>
              <span className="text-sm text-gray-500 ml-auto">
                Total: {formatCurrency(Number(product.price) * qty)}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bottom Actions */}
      {product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 px-4 py-4 flex gap-3 safe-area-bottom">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 border-2 border-emerald-600 rounded-2xl text-emerald-600 font-bold text-sm active:scale-95 transition-transform"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white font-bold text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}
