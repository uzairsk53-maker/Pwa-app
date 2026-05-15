import { useState, useEffect } from 'react';
import { orderApi } from '@/services/orderApi';

export function useLiveTracking(orderId: string, isTrackingActive: boolean, defaultPickup: [number, number], defaultDrop: [number, number]) {
  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!isTrackingActive || !orderId) return;

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchLiveLocation = async () => {
      try {
        const order = await orderApi.getOrderById(orderId);
        if (order.deliveryAssignments && order.deliveryAssignments.length > 0) {
          const boy = order.deliveryAssignments[0].deliveryBoy;
          if (boy?.latitude && boy?.longitude) {
            if (isMounted) {
              setLiveLocation([Number(boy.latitude), Number(boy.longitude)]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch live location:", error);
      }

      if (isMounted) {
        // Poll every 10 seconds for updated location
        timeoutId = setTimeout(fetchLiveLocation, 10000);
      }
    };

    fetchLiveLocation();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [orderId, isTrackingActive]);

  return { liveLocation };
}
