import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { deliveryApi } from '@/services/deliveryApi';

export function useDeliveryLocationBroadcaster() {
  const user = useAuthStore((s) => s.user);
  const lastUpdateTime = useRef<number>(0);

  useEffect(() => {
    if (!user || user.role !== 'DELIVERY') return;
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const now = Date.now();
        
        // Only update backend every 10 seconds to prevent spamming
        if (now - lastUpdateTime.current > 10000) {
          lastUpdateTime.current = now;
          deliveryApi.updateLocation({ latitude, longitude }).catch(console.error);
        }
      },
      (error) => {
        console.warn("Delivery background geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // Accept 10-second old cached positions
        timeout: 10000 // Timeout if we can't get a location in 10s
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);
}
