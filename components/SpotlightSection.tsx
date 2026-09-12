'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Sparkles, ArrowRight, Quote } from 'lucide-react';
import { Restaurant } from '@/types';

interface SpotlightSectionProps {
  restaurants: Restaurant[];
}

export default function SpotlightSection({ restaurants }: SpotlightSectionProps) {
  const favoriteRestaurants = restaurants
    .filter((r) => r.is_favorite || r.rating === 5)
    .slice(0, 6);

  if (favoriteRestaurants.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C85A32]">
              Tuyển Tập Vị Giác
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Góc Quán Được Yêu Thích Nhất
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Những địa chỉ đạt đánh giá 5 sao tròn trĩnh hoặc nằm trong danh sách quán ruột
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#163323]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{favoriteRestaurants.length} quán tâm điểm</span>
        </div>
      </div>

      {/* Grid of Curated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {favoriteRestaurants.map((res) => {
          const photo =
            res.cover_photo ||
            res.photos?.[0]?.photo_url ||
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

          return (
            <Link
              key={res.id}
              href={`/quan-an/${res.id}`}
              className="group relative rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(22,51,35,0.08)] hover:border-[#163323]/25 transition-all duration-300 flex flex-col"
            >
              {/* Photo Enclosure */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                <Image
                  src={photo}
                  alt={res.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Top badges: Golden rating & Price */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#163323]/85 backdrop-blur-md text-[#D4A373] text-xs font-bold shadow-xs border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
                    <span>{res.rating}.0</span>
                  </div>

                  {res.price_range && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10">
                      {res.price_range}
                    </span>
                  )}
                </div>

                {/* Primary Tag */}
                {res.tags && res.tags[0] && (
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-[#163323] shadow-xs">
                      {res.tags[0].name}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900 group-hover:text-[#163323] transition-colors line-clamp-1">
                    {res.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span>{res.address}</span>
                  </div>
                </div>

                {/* Note / Quote */}
                {res.note ? (
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/60 text-xs text-stone-600 italic line-clamp-2 flex items-start gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
                    <span>&ldquo;{res.note}&rdquo;</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-600 font-medium">
                    Bấm để xem cảm nhận & chỉ đường chi tiết
                  </div>
                )}

                {/* Footer link hint */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#163323] group-hover:translate-x-0.5 transition-transform">
                  <span>Xem sổ tay quán</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C85A32]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
