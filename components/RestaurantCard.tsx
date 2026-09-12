'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Heart, ArrowRight, Star, MessageSquare } from 'lucide-react';
import { Restaurant } from '@/types';
import { formatDistance } from '@/lib/distance';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const photoUrl =
    restaurant.cover_photo ||
    restaurant.photos?.[0]?.photo_url ||
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

  const categoryName = restaurant.tags?.[0]?.name || 'Quán ăn ngon';

  return (
    <div className="group relative bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(22,51,35,0.08)] hover:border-[#163323]/30 transition-all duration-300 flex flex-col">
      {/* Khung ảnh quán ăn với viền bo tròn nhẹ */}
      <Link
        href={`/quan-an/${restaurant.id}`}
        className="relative aspect-4/3 overflow-hidden rounded-2xl m-2.5 bg-stone-100 block"
      >
        <Image
          src={photoUrl}
          alt={`Ảnh quán ${restaurant.name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Cự ly hiển thị dưới góc trái ảnh (như ảnh mẫu: 📍 11,5 km) */}
        {restaurant.distance !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-stone-200/60 pointer-events-none">
            <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>{formatDistance(restaurant.distance)}</span>
          </div>
        )}

        {/* Badge 1 review (nếu có review/ghi chú) */}
        {restaurant.note && (
          <div className="absolute top-2.5 left-2.5 bg-emerald-50/95 backdrop-blur-xs text-[#163323] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-emerald-200/70 pointer-events-none">
            <MessageSquare className="w-3 h-3 text-[#163323]" />
            <span>1 review</span>
          </div>
        )}

        {/* Badge Quán ruột */}
        {restaurant.is_favorite && (
          <div className="absolute top-2.5 right-2.5 bg-[#C85A32] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 pointer-events-none">
            <Heart className="w-2.5 h-2.5 fill-white text-white" />
            <span>Quán ruột</span>
          </div>
        )}
      </Link>

      {/* Thông tin quán */}
      <div className="px-3.5 pb-3.5 pt-0.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Hàng 1: Category uppercase & Điểm đánh giá sao */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-[#C85A32] uppercase tracking-wider truncate">
              {categoryName}
            </span>
            <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-stone-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Hàng 2: Tên quán */}
          <h3 className="font-bold text-base text-stone-900 group-hover:text-[#163323] transition-colors line-clamp-1 mb-1">
            <Link href={`/quan-an/${restaurant.id}`}>
              {restaurant.name}
            </Link>
          </h3>

          {/* Hàng 3: Địa chỉ chi tiết */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {restaurant.address}
          </p>
        </div>

        {/* Hàng 4: Tag loại món & Nút mũi tên tròn điều hướng */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 mt-auto">
          <span className="inline-block text-[11px] font-medium text-stone-600 bg-stone-100/90 px-2.5 py-0.5 rounded-md truncate max-w-[170px]">
            {categoryName}
          </span>

          <Link
            href={`/quan-an/${restaurant.id}`}
            className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 group-hover:border-[#163323] group-hover:bg-[#163323] group-hover:text-white transition-all shrink-0 cursor-pointer"
            aria-label={`Xem chi tiết quán ${restaurant.name}`}
          >
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
