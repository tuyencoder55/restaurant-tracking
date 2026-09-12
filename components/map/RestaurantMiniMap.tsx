'use client';

import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface RestaurantMiniMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function RestaurantMiniMap({
  latitude,
  longitude,
  name,
}: RestaurantMiniMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([ReactLeaflet, L]) => {
      const customIcon = L.default.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setMapComponents({
        MapContainer: ReactLeaflet.MapContainer,
        TileLayer: ReactLeaflet.TileLayer,
        Marker: ReactLeaflet.Marker,
        Popup: ReactLeaflet.Popup,
        customIcon,
      });
    });
  }, []);

  if (!isClient || !MapComponents) {
    return (
      <div className="w-full h-48 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 animate-pulse border border-stone-200">
        <span className="text-xs">Đang tải vị trí bản đồ...</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, customIcon } = MapComponents;

  return (
    <div className="w-full h-56 rounded-2xl overflow-hidden border border-stone-200 shadow-xs relative z-0">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={customIcon}>
          <Popup>
            <span className="font-semibold text-xs text-stone-900">{name}</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
