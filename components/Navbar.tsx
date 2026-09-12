'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Plus, MapPin, Grid, Shield } from 'lucide-react';

interface NavbarProps {
  activeTab?: 'list' | 'map';
  onTabChange?: (tab: 'list' | 'map') => void;
  onOpenRandom?: () => void;
}

export default function Navbar({ activeTab = 'list', onTabChange, onOpenRandom }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full py-2.5 sm:py-3 px-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto backdrop-blur-xl bg-[#FAF8F5]/92 border border-stone-200/80 rounded-2xl sm:rounded-full px-3 sm:px-6 h-13 sm:h-15 flex items-center justify-between shadow-[0_4px_24px_rgba(22,51,35,0.06)] transition-all">
        {/* Brand Identity: TRẤN TUYÊN */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-full bg-[#163323] text-[#D4A373] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <span className="font-serif font-black text-xs sm:text-sm tracking-tighter">T・T</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-stone-900 group-hover:text-[#163323] transition-colors whitespace-nowrap">
                TRẤN TUYÊN
              </span>
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#C85A32]" />
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-widest text-[#C85A32]">
                Tuyển Chọn
              </span>
            </div>
            <span className="hidden md:block text-[11px] text-stone-500 font-medium">
              Sổ tay ẩm thực bản địa
            </span>
          </div>
        </Link>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Random Discovery Button (chỉ hiện từ tablet trở lên, mobile dùng nút ở Hero) */}
          {onOpenRandom && (
            <button
              onClick={onOpenRandom}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#163323] bg-[#163323]/5 hover:bg-[#163323]/10 border border-[#163323]/10 transition-colors cursor-pointer shrink-0"
            >
              <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Gợi ý Vị</span>
            </button>
          )}

          {/* List vs Map Segmented Slider (thu gọn icon trên mobile) */}
          {onTabChange && (
            <div className="flex p-0.5 sm:p-1 bg-stone-200/60 rounded-xl sm:rounded-full border border-stone-200/80 shrink-0">
              <button
                type="button"
                onClick={() => onTabChange('list')}
                title="Xem dạng danh sách"
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg sm:rounded-full transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('map')}
                title="Xem trên bản đồ"
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg sm:rounded-full transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                <span className="hidden sm:inline">Bản đồ</span>
              </button>
            </div>
          )}

          {/* Admin Dashboard Quick Link */}
          <Link
            href="/admin"
            title="Quản trị duyệt quán"
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-stone-500" />
            <span>Quản trị</span>
          </Link>

          {/* Nút Đóng góp quán mới: tự co giãn thông minh không bao giờ rớt dòng chữ */}
          <Link
            href="/them-quan"
            className="inline-flex items-center gap-1.5 px-3 sm:pl-3.5 sm:pr-2 py-1.5 rounded-full text-xs font-bold text-white bg-[#163323] hover:bg-[#1f4732] active:scale-95 transition-all shadow-xs shrink-0 whitespace-nowrap group"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4A373] group-hover:rotate-90 transition-transform shrink-0" />
            <span className="hidden sm:inline">Đóng góp quán</span>
            <span className="sm:hidden">Thêm</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
