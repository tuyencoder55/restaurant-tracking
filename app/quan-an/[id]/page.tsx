'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MapPin,
  Heart,
  Banknote,
  ExternalLink,
  Share2,
  Bookmark,
  Quote,
  Star,
} from 'lucide-react';
import { getRestaurantById } from '@/lib/restaurants';
import { Restaurant } from '@/types';
import StarRating from '@/components/StarRating';
import RestaurantMiniMap from '@/components/map/RestaurantMiniMap';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      try {
        const data = await getRestaurantById(id);
        setRestaurant(data);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết quán:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-[#163323] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#163323]/10 text-[#163323] flex items-center justify-center mx-auto mb-3 font-serif font-black text-sm">
          T・T
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Không tìm thấy quán ăn</h2>
        <p className="text-sm text-stone-500 mb-5">Địa chỉ này có thể đã được dời hoặc liên kết không đúng.</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-[#163323] text-white text-xs font-bold shadow-xs hover:bg-[#1e442f] transition-colors"
        >
          Quay lại trang chủ Trấn Tuyên
        </Link>
      </div>
    );
  }

  const allPhotos = restaurant.photos && restaurant.photos.length > 0
    ? restaurant.photos.map((p) => p.photo_url)
    : [restaurant.cover_photo || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'];

  const currentPhoto = allPhotos[selectedPhotoIndex] || allPhotos[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Top Floating Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại sổ tay</span>
          </button>

          <div className="flex items-center gap-2">
            {restaurant.is_favorite && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#C85A32] px-3 py-1 rounded-full shadow-xs">
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>Quán ruột</span>
              </span>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: restaurant.name,
                    text: `Xem quán ${restaurant.name} trên Trấn Tuyên — Sổ tay ẩm thực tuyển chọn!`,
                    url: window.location.href,
                  });
                }
              }}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
              title="Chia sẻ quán này"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: Gallery & MiniMap */}
          <div className="lg:col-span-7 space-y-5">
            {/* Ảnh chính lớn */}
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden bg-stone-100 shadow-[0_4px_24px_rgba(22,51,35,0.06)] border border-stone-200/90">
              <Image
                src={currentPhoto}
                alt={restaurant.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {allPhotos.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {allPhotos.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-20 h-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedPhotoIndex === idx
                        ? 'border-[#163323] shadow-md scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={url} alt={`Ảnh ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* MiniMap */}
            {typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number' && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Vị trí định vị trên bản đồ
                  </span>
                </div>
                <RestaurantMiniMap
                  latitude={restaurant.latitude}
                  longitude={restaurant.longitude}
                  name={restaurant.name}
                />
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Thông tin, Cảm nhận & Chỉ đường */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
              {/* Category Tags */}
              {restaurant.tags && restaurant.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {restaurant.tags.map((t) => (
                    <span
                      key={t.id}
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#FAF8F5] text-[#163323] border border-stone-200/70"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                {restaurant.name}
              </h1>

              {/* Star Rating Badge */}
              <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#163323] text-[#D4A373] text-xs font-bold shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-[#D4A373]" />
                  <span>{restaurant.rating}.0 sao</span>
                </div>
                <StarRating rating={restaurant.rating} size="sm" />
              </div>

              {/* Address & Price */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5 text-stone-700">
                  <MapPin className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{restaurant.address}</span>
                </div>

                {restaurant.price_range && (
                  <div className="flex items-center gap-2.5 text-stone-700">
                    <Banknote className="w-4 h-4 text-[#163323] shrink-0" />
                    <span>
                      Mức giá tham khảo: <strong className="text-stone-900">{restaurant.price_range}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Field Note / Personal quote */}
              {restaurant.note && (
                <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4.5 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#163323] uppercase tracking-wider mb-2">
                    <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Ghi chú vị giác & Món nên gọi</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic flex items-start gap-2">
                    <Quote className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                    <span>&ldquo;{restaurant.note}&rdquo;</span>
                  </p>
                </div>
              )}

              {/* Google Maps Route Button */}
              <div className="pt-2">
                <a
                  href={
                    restaurant.google_maps_url ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${restaurant.name} ${restaurant.address}`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#163323] hover:bg-[#1e442f] text-white font-bold text-sm shadow-md shadow-[#163323]/25 active:scale-97 transition-all"
                >
                  <MapPin className="w-4 h-4 text-[#D4A373]" />
                  <span>Mở chỉ đường trên Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
