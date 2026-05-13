import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Edit3,
  LogOut,
  ChevronRight,
  Shield,
  Truck,
} from 'lucide-react';
import { deliveryApi } from '@/services/deliveryApi';
import { useAuthStore } from '@/store/authStore';
import { STALE_TIMES } from '@/constants';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LocationPickerMap } from '@/components/ui/LocationPickerMap';
import toast from 'react-hot-toast';

const editProfileSchema = z.object({
  name: z.string().min(2).optional(),
  vehicleNo: z.string().optional(),
  city: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export function DeliveryProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['delivery-profile'],
    queryFn: deliveryApi.getProfile,
    staleTime: STALE_TIMES.PROFILE,
  });

  const updateMutation = useMutation({
    mutationFn: deliveryApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-profile'] });
      toast.success('Profile updated!');
      setShowEditSheet(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Update failed');
    },
  });

  const profile = response?.data?.profile;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    values: {
      name: profile?.name || '',
      vehicleNo: profile?.vehicleNo || '',
      city: profile?.city || '',
      email: profile?.email || '',
      latitude: profile?.latitude ? Number(profile.latitude) : undefined,
      longitude: profile?.longitude ? Number(profile.longitude) : undefined,
    },
  });

  const onSubmit = (data: EditProfileForm) => {
    const filteredData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (value.trim()) filteredData[key] = value;
      } else if (value !== undefined) {
        filteredData[key] = value;
      }
    });
    updateMutation.mutate(filteredData as any);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleUpdateLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Fetching your location...', { id: 'location' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        toast.success('Pin moved to your current location!', { id: 'location' });
        setShowEditSheet(true);
      },
      (error) => {
        toast.error('Failed to get location. Please enable location services.', { id: 'location' });
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  const currentLat = watch('latitude');
  const currentLng = watch('longitude');
  const mapPosition: [number, number] = 
    currentLat && currentLng ? [currentLat, currentLng] : [21.0107, 75.5679];

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-800 via-indigo-900 to-black px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-400" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-purple-400" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Truck size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{profile?.name || 'Delivery Partner'}</h1>
            <p className="text-indigo-200 text-sm">{profile?.vehicleNo || 'No vehicle specified'}</p>
            <div className="flex items-center gap-2 mt-1">
              <Shield size={12} className="text-indigo-400" />
              <span className="text-xs text-indigo-400 font-medium">Verified Partner</span>
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
        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-sm"
        >
          {[
            { icon: User, label: 'Name', value: profile?.name },
            { icon: Phone, label: 'Phone', value: profile?.phone },
            { icon: Truck, label: 'Vehicle No.', value: profile?.vehicleNo || 'Not set' },
            { icon: Mail, label: 'Email', value: profile?.email || 'Not set' },
            { icon: Building, label: 'City', value: profile?.city || 'Not set' },
            { 
              icon: MapPin, 
              label: 'Live Location (GPS)', 
              value: profile?.latitude && profile?.longitude 
                ? `${Number(profile.latitude).toFixed(4)}, ${Number(profile.longitude).toFixed(4)}` 
                : 'Not set' 
            },
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
          transition={{ delay: 0.1 }}
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
            onClick={handleUpdateLocation}
            disabled={updateMutation.isPending}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 text-left">Update Live Location</span>
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
            { name: 'name' as const, label: 'Full Name', icon: User },
            { name: 'vehicleNo' as const, label: 'Vehicle Number', icon: Truck },
            { name: 'email' as const, label: 'Email', icon: Mail },
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          {/* Map Picker for Store Location */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Live Location (Pin on Map)
              </label>
              <button 
                type="button" 
                onClick={handleUpdateLocation}
                className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md"
              >
                Use GPS
              </button>
            </div>
            <LocationPickerMap 
              position={mapPosition} 
              onPositionChange={(pos) => {
                setValue('latitude', pos[0], { shouldDirty: true });
                setValue('longitude', pos[1], { shouldDirty: true });
              }} 
            />
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl disabled:opacity-50"
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
        message="Are you sure you want to logout?"
        confirmText="Logout"
        variant="danger"
      />
    </div>
  );
}
