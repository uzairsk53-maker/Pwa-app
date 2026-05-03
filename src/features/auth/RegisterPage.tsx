import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShoppingCart, Phone, Lock, User, Store, MapPin, Building } from 'lucide-react';
import { authApi } from '@/services/authApi';

const registerSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopName: z.string().min(2, 'Shop name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await authApi.register(data);
      toast.success('Registration successful! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'shopName' as const, label: 'Shop Name', icon: Store, placeholder: 'Your shop name', type: 'text' },
    { name: 'ownerName' as const, label: 'Owner Name', icon: User, placeholder: 'Full name', type: 'text' },
    { name: 'phone' as const, label: 'Phone Number', icon: Phone, placeholder: '10-digit number', type: 'tel' },
    { name: 'address' as const, label: 'Address', icon: MapPin, placeholder: 'Shop address', type: 'text' },
    { name: 'city' as const, label: 'City', icon: Building, placeholder: 'City name', type: 'text' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex flex-col max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 pb-6 px-8 text-center"
      >
        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShoppingCart size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Create Account</h1>
        <p className="text-emerald-100 text-sm">Register your shop to get started</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 bg-white dark:bg-gray-900 rounded-t-[2rem] px-6 pt-6 pb-8 overflow-y-auto"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <field.icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register(field.name)}
                  type={field.type}
                  inputMode={field.type === 'tel' ? 'numeric' : undefined}
                  placeholder={field.placeholder}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
                />
              </div>
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-60 active:scale-[0.98] mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
