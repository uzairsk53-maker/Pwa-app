import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShoppingCart, Phone, Lock } from 'lucide-react';
import { authApi } from '@/services/authApi';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await authApi.login({
        phone: data.phone,
        password: data.password,
        role: 'SHOPKEEPER',
      });
      setAuth(result.accessToken, result.refreshToken, result.user);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex flex-col max-w-[480px] mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-10 px-8 text-center"
      >
        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <ShoppingCart size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Shop Credit</h1>
        <p className="text-emerald-100 text-sm">Your trusted grocery credit partner</p>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 bg-white dark:bg-gray-900 rounded-t-[2rem] px-6 pt-8 pb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Sign in to manage your shop</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Phone field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('phone')}
                type="tel"
                inputMode="numeric"
                placeholder="Enter 10-digit number"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
