'use client';

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Tag } from '@/types';

interface FilterBarProps {
  tags: Tag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  availableDistricts: string[];
  minRating: number | null;
  onSelectMinRating: (rating: number | null) => void;
  sortBy: 'near' | 'newest' | 'rating' | 'favorite';
  onSelectSortBy: (sort: 'near' | 'newest' | 'rating' | 'favorite') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterBar({
  tags = [],
  selectedTagId,
  onSelectTag,
  searchQuery,
  onSearchChange,
  selectedDistrict = '',
  onSelectDistrict,
  availableDistricts = [],
  minRating,
  onSelectMinRating,
  sortBy = 'near',
  onSelectSortBy,
  onResetFilters,
  hasActiveFilters = false,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
        {/* 1. TỪ KHÓA */}
        <div className="lg:col-span-1">
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Từ khóa
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tên quán, món ăn..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#163323] focus:bg-white transition-all h-[38px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 2. LOẠI MÓN */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Loại món
          </label>
          <select
            value={selectedTagId || ''}
            onChange={(e) => onSelectTag(e.target.value || null)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#163323] focus:bg-white transition-all h-[38px] cursor-pointer"
          >
            <option value="">Tất cả</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. KHU VỰC */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Khu vực
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => onSelectDistrict(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#163323] focus:bg-white transition-all h-[38px] cursor-pointer"
          >
            <option value="">Tất cả quận/huyện</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 4. ĐÁNH GIÁ */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Đánh giá
          </label>
          <select
            value={minRating === null ? '' : minRating.toString()}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              onSelectMinRating(val);
            }}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#163323] focus:bg-white transition-all h-[38px] cursor-pointer"
          >
            <option value="">Tất cả</option>
            <option value="5">5 sao</option>
            <option value="4">Từ 4 sao trở lên</option>
            <option value="3">Từ 3 sao trở lên</option>
          </select>
        </div>

        {/* 5. SẮP XẾP */}
        <div>
          <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Sắp xếp
          </label>
          <select
            value={sortBy}
            onChange={(e) =>
              onSelectSortBy(e.target.value as 'near' | 'newest' | 'rating' | 'favorite')
            }
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#163323] focus:bg-white transition-all h-[38px] cursor-pointer"
          >
            <option value="near">Gần nhất</option>
            <option value="newest">Mới cập nhật</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="favorite">Quán ruột</option>
          </select>
        </div>

        {/* 6. NÚT LỌC QUÁN */}
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="flex-1 bg-[#163323] hover:bg-[#1f4732] text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs h-[38px] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc quán</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Đặt lại bộ lọc"
              className="bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl px-2.5 py-2 text-xs transition-all h-[38px] flex items-center justify-center cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
