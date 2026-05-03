import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Store,
  Phone,
  Mail,
  MapPin,
  Building,
  Edit3,
  LogOut,
  ChevronRight,
  Shield,
  Star,
  Award,
} from 'lucide-react';
import { shopkeeperApi } from '@/services/shopkeeperApi';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { STALE_TIMES } from '@/constants';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

const editProfileSchema = z.object({
  shopName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  address: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clearCart);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: shopkeeperApi.getDashboard,
    staleTime: STALE_TIMES.PROFILE,
  });

  const updateMutation = useMutation({
    mutationFn: shopkeeperApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Profile updated!');
      setShowEditSheet(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Update failed');
    },
  });

  const profile = dashboard?.profile;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    values: {
      shopName: profile?.shopName || '',
      ownerName: profile?.ownerName || '',
      address: profile?.address || '',
      city: profile?.city || '',
      email: profile?.email || '',
    },
  });

  const onSubmit = (data: EditProfileForm) => {
    const filteredData: Record<string, string> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value && value.trim()) filteredData[key] = value;
    });
    updateMutation.mutate(filteredData as any);
  };

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/login', { replace: true });
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-400" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-teal-400" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{profile?.ownerName || 'User'}</h1>
            <p className="text-gray-400 text-sm">{profile?.shopName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Shield size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Verified Shopkeeper</span>
            </div>
          </div>
          <button
            onClick={() => setShowEditSheet(true)}
            className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center"
          >
            <Edit3 size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-14 relative z-10 space-y-4 pb-8">
        {/* Score Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
            <Award size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Credit Score</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {dashboard?.creditSummary?.score?.toLocaleString() ?? 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Points</p>
            <p className="text-lg font-bold text-emerald-600">{dashboard?.creditSummary?.points ?? 0}</p>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden"
        >
          {[
            { icon: Store, label: 'Shop Name', value: profile?.shopName },
            { icon: User, label: 'Owner', value: profile?.ownerName },
            { icon: Phone, label: 'Phone', value: profile?.phone || profile?.user?.phone },
            { icon: Mail, label: 'Email', value: profile?.email || profile?.user?.email || 'Not set' },
            { icon: MapPin, label: 'Address', value: profile?.address || 'Not set' },
            { icon: Building, label: 'City', value: profile?.city || 'Not set' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.value || '—'}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <button
            onClick={() => setShowEditSheet(true)}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Edit3 size={16} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 text-left">Edit Profile</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <LogOut size={16} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600 flex-1 text-left">Logout</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </motion.div>
      </div>

      {/* Edit Profile Bottom Sheet */}
      <BottomSheet isOpen={showEditSheet} onClose={() => setShowEditSheet(false)} title="Edit Profile">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'shopName' as const, label: 'Shop Name', icon: Store },
            { name: 'ownerName' as const, label: 'Owner Name', icon: User },
            { name: 'email' as const, label: 'Email', icon: Mail },
            { name: 'address' as const, label: 'Address', icon: MapPin },
            { name: 'city' as const, label: 'City', icon: Building },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <field.icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register(field.name)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </BottomSheet>

      {/* Logout Confirm */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? Your cart will be cleared."
        confirmText="Logout"
        variant="danger"
      />
    </div>
  );
}
