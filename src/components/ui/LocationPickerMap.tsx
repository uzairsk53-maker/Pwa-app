import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function LocationPickerMap({ 
  position, 
  onPositionChange 
}: { 
  position: [number, number]; 
  onPositionChange: (pos: [number, number]) => void 
}) {
  function MapEvents() {
    useMapEvents({
      click(e) {
        onPositionChange([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm z-0">
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: '250px', width: '100%' }}
      >
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        <Marker position={position} icon={icon} />
        <MapEvents />
        <MapUpdater center={position} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-2 rounded-lg text-[10px] text-gray-600 dark:text-gray-300 font-medium z-[400] shadow-sm text-center">
        Tap anywhere on the map to place your exact store pin
      </div>
    </div>
  );
}
