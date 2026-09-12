'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Restaurant } from '@/types';
import StarRating from '@/components/StarRating';
import { formatDistance } from '@/lib/distance';
import 'leaflet/dist/leaflet.css';

interface RestaurantsMapProps {
  restaurants: Restaurant[];
  userLocation?: { latitude: number; longitude: number } | null;
}

export default function RestaurantsMap({ restaurants, userLocation }: RestaurantsMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [MapComponents, setMapComponents] = useState<any>(null);

  // Chỉ tải Leaflet phía client để tránh lỗi SSR
  useEffect(() => {
    setIsClient(true);
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([ReactLeaflet, L]) => {
      // Sửa lỗi icon marker mặc định của Leaflet trên Webpack/Next.js
      const customIcon = L.default.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const userIcon = L.default.divIcon({
        className: 'custom-user-marker',
        html: `<div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background-color: rgba(200, 90, 50, 0.35); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; background-color: #C85A32; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 5px; height: 5px; background-color: #ffffff; border-radius: 9999px;"></div>
          </div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      setMapComponents({
        MapContainer: ReactLeaflet.MapContainer,
        TileLayer: ReactLeaflet.TileLayer,
        Marker: ReactLeaflet.Marker,
        Popup: ReactLeaflet.Popup,
        customIcon,
        userIcon,
      });
    });
  }, []);

  if (!isClient || !MapComponents) {
    return (
      <div className="w-full h-[480px] rounded-3xl bg-stone-100/70 flex items-center justify-center text-stone-400 animate-pulse border border-stone-200">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#163323] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs font-semibold text-stone-600">Đang tải bản đồ quán ăn...</span>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, customIcon, userIcon } = MapComponents;

  // Lọc các quán có toạ độ hợp lệ
  const validRestaurants = restaurants.filter(
    (r) => typeof r.latitude === 'number' && typeof r.longitude === 'number'
  );

  // Tâm bản đồ: ưu tiên vị trí người dùng, hoặc toạ độ quán đầu tiên, hoặc trung tâm TP.HCM
  const centerLat = userLocation?.latitude || validRestaurants[0]?.latitude || 10.7769;
  const centerLng = userLocation?.longitude || validRestaurants[0]?.longitude || 106.7009;

  return (
    <div className="w-full h-[520px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-[0_4px_24px_rgba(22,51,35,0.06)] relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={userLocation ? 14 : 13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker vị trí hiện tại của người dùng */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center p-1 font-sans">
                <div className="text-xs font-bold text-[#163323] flex items-center justify-center gap-1">
                  <span>📍</span>
                  <span>Vị trí của bạn</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Toạ độ định vị hiện tại
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {validRestaurants.map((res) => {
          const photo =
            res.cover_photo ||
            res.photos?.[0]?.photo_url ||
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

          return (
            <Marker
              key={res.id}
              position={[res.latitude!, res.longitude!]}
              icon={customIcon}
            >
              <Popup className="restaurant-popup">
                <div className="w-56 p-1">
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-100 mb-2">
                    <Image
                      src={photo}
                      alt={res.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 line-clamp-1 mb-1">
                    {res.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mb-1">
                    <StarRating rating={res.rating} size="sm" />
                    <span className="text-xs font-semibold text-stone-700">{res.rating}.0</span>
                  </div>

                  {res.distance !== undefined && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C85A32] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-stone-200 mb-1.5">
                      <span>Cách bạn:</span>
                      <span>{formatDistance(res.distance)}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-500 line-clamp-2 mb-2">
                    {res.address}
                  </p>
                  <Link
                    href={`/quan-an/${res.id}`}
                    className="block text-center w-full py-1.5 px-3 rounded-xl bg-[#163323] hover:bg-[#1f4732] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Xem chi tiết quán
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
