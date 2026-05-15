import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Clock, MapPin, Navigation } from 'lucide-react';

// Custom icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${icon}
        </svg>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${color};
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
      "></div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

const storeIconPath = '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';
const userIconPath = '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>';
const riderIconPath = '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>';

const storeIcon = createCustomIcon('#3b82f6', storeIconPath);
const userIcon = createCustomIcon('#10b981', userIconPath);
const riderIcon = createCustomIcon('#f59e0b', riderIconPath);

// Center map component
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface DeliveryTrackingMapProps {
  status: string;
  pickupLocation?: [number, number];
  deliveryLocation?: [number, number];
  liveRiderLocation?: [number, number] | null;
}

export function DeliveryTrackingMap({ 
  status, 
  pickupLocation, 
  deliveryLocation, 
  liveRiderLocation 
}: DeliveryTrackingMapProps) {
  // Use provided coordinates or default to dummy demo coordinates
  const storeLocation: [number, number] = pickupLocation || [28.6139, 77.2090];
  const userLocation: [number, number] = deliveryLocation || [28.6250, 77.2150];
  
  // Create a curved path between store and user
  const routePath: [number, number][] = [
    storeLocation,
    [storeLocation[0] + (userLocation[0] - storeLocation[0]) * 0.3, storeLocation[1] + (userLocation[1] - storeLocation[1]) * 0.3 + 0.003],
    [storeLocation[0] + (userLocation[0] - storeLocation[0]) * 0.7, storeLocation[1] + (userLocation[1] - storeLocation[1]) * 0.7 + 0.003],
    userLocation
  ];

  const [riderLocation, setRiderLocation] = useState<[number, number]>(storeLocation);
  const [eta, setEta] = useState(15);
  const progressRef = useRef(0);

  // If we have a live rider location (e.g., from WebSockets / Delivery Boy App), use it.
  useEffect(() => {
    if (liveRiderLocation) {
      setRiderLocation(liveRiderLocation);
    }
  }, [liveRiderLocation]);

  // No fake simulation. Rider location only updates if real liveRiderLocation is provided.

  if (status === 'PENDING' || status === 'APPROVED') {
    return null; // Don\'t show map yet
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 ring-1 ring-black/5"
    >
      <style>
        {`
          .leaflet-marker-icon {
            transition: transform 2s linear !important;
          }
        `}
      </style>
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
              <Navigation size={20} className="text-emerald-500" />
              Live Tracking
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {status === 'PACKED' ? 'Waiting for delivery partner to pickup' : 'Delivery partner is on the way'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-emerald-100 dark:border-emerald-900/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-1.5 rounded-full">
              <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                {status === 'PACKED' ? '10 mins' : `${eta} mins`}
              </p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                {status === 'PACKED' ? 'Est. Pickup' : 'Est. Delivery'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-72 w-full relative z-0">
        <MapContainer 
          center={storeLocation} 
          zoom={14} 
          scrollWheelZoom={false}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Polyline 
            positions={routePath} 
            color="#10b981" 
            weight={5} 
            opacity={0.8}
            dashArray="10, 10"
            className="animate-pulse"
          />

          <Marker position={storeLocation} icon={storeIcon}>
            <Popup>Store Location</Popup>
          </Marker>

          <Marker position={userLocation} icon={userIcon}>
            <Popup>Delivery Location</Popup>
          </Marker>

          {(status === 'SHIPPED' || status === 'PACKED') && (
            <Marker position={riderLocation} icon={riderIcon}>
              <Popup>Delivery Partner</Popup>
            </Marker>
          )}

          <MapUpdater center={status === 'SHIPPED' ? riderLocation : storeLocation} zoom={status === 'SHIPPED' ? 15 : 14} />
        </MapContainer>
        
        {/* Overlay gradient for premium feel */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] z-[400]"></div>
      </div>
    </motion.div>
  );
}
