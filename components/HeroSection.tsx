'use client';

import React from 'react';
import { Compass, MapPin, Sparkles, Bookmark, Flame } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  totalCount: number;
  favoriteCount: number;
  onOpenRandom: () => void;
  onViewMap: () => void;
  onSelectMoodTag?: (tagQuery: string) => void;
}

export default function HeroSection({
  totalCount,
  favoriteCount,
  onOpenRandom,
  onViewMap,
  onSelectMoodTag,
}: HeroSectionProps) {
  const moodTags = [
    { label: '🍜 Nước dùng ngọt ấm', query: 'phở bún' },
    { label: '🥩 Đậm vị thơm lừng', query: 'lẩu bò nướng' },
    { label: '☕ Cà phê chill góc phố', query: 'cà phê' },
    { label: '🍚 Cơm dẻo chuẩn vị', query: 'cơm' },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#163323]/[0.04] via-[#D4A373]/[0.08] to-transparent border border-[#163323]/10 p-6 sm:p-10 md:p-12 mb-10 transition-all">
      {/* Background ambient orbs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#D4A373]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#163323]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 space-y-5">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#163323]/5 border border-[#163323]/15 text-[#163323] text-[11px] font-bold tracking-wider uppercase">
            <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Sổ Tay Vị Giác Chọn Lọc</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.2]">
            Những góc quán giữ trọn{' '}
            <span className="text-[#163323] underline decoration-[#D4A373]/60 decoration-wavy decoration-2 underline-offset-6 sm:underline-offset-8">
              phong vị thành phố
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-stone-600 leading-relaxed max-w-xl">
            Lưu giữ những hương vị đáng nhớ, từ hàng quán gia đình mộc mạc đến điểm hẹn cà phê thân thuộc. Mở bản đồ tìm kiếm hoặc để la bàn chọn ngẫu nhiên món ngon cho bạn!
          </p>

          {/* Main Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onOpenRandom}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#163323] hover:bg-[#1e442f] text-white font-bold text-sm shadow-md shadow-[#163323]/25 active:scale-97 transition-all cursor-pointer group"
            >
              <Compass className="w-4 h-4 text-[#D4A373] group-hover:rotate-45 transition-transform duration-300" />
              <span>Gợi ý vị ngẫu nhiên</span>
            </button>

            <button
              type="button"
              onClick={onViewMap}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 font-semibold text-sm shadow-xs active:scale-97 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#C85A32]" />
              <span>Xem trên bản đồ</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-3.5 border-t border-stone-200/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-600">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-[#163323] shrink-0" />
              <span>
                <strong className="text-stone-900 text-sm">{totalCount}</strong> địa điểm đã lưu
              </span>
            </div>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-stone-700 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
              <span>
                <strong className="text-stone-900 text-sm">{favoriteCount}</strong> quán ruột 5 sao
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Culinary Compass Interactive Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl bg-[#163323] text-stone-100 p-6 sm:p-7 border border-[#D4A373]/20 shadow-xl shadow-[#163323]/15 overflow-hidden">
            {/* Concentric watermark */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute -right-16 -bottom-16 w-60 h-60 rounded-full border border-white/5 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4A373]">
                  Khám phá theo khẩu vị
                </span>
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
              </div>

              <h2 className="text-lg font-bold text-white leading-snug">
                Hôm nay tâm trạng bạn đang nghiêng về hương vị nào?
              </h2>

              <p className="text-xs text-stone-300 leading-relaxed">
                Bấm vào một gợi ý để tìm ngay những góc quán đúng gu nhất:
              </p>

              {/* Mood pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {moodTags.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectMoodTag?.(m.query)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-stone-100 hover:text-white transition-colors cursor-pointer"
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400">
                <span>Bộ lọc cập nhật theo thời gian thực</span>
                <Link
                  href="/them-quan"
                  className="text-[#D4A373] hover:underline font-semibold"
                >
                  + Thêm quán của bạn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
