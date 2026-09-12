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
    <header className="sticky top-0 z-40 w-full py-3 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto backdrop-blur-xl bg-[#FAF8F5]/90 border border-stone-200/80 rounded-2xl sm:rounded-full px-4 sm:px-6 h-15 flex items-center justify-between shadow-[0_4px_24px_rgba(22,51,35,0.05)] transition-all">
        {/* Brand Identity: TRẤN TUYÊN */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl sm:rounded-full bg-[#163323] text-[#D4A373] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-serif font-black text-sm tracking-tighter">T・T</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-stone-900 group-hover:text-[#163323] transition-colors">
                TRẤN TUYÊN
              </span>
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#C85A32]" />
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-widest text-[#C85A32]">
                Tuyển Chọn
              </span>
            </div>
            <span className="hidden sm:block text-[11px] text-stone-600 font-medium">
              Sổ tay ẩm thực bản địa
            </span>
          </div>
        </Link>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Random Discovery Button */}
          {onOpenRandom && (
            <button
              onClick={onOpenRandom}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#163323] bg-[#163323]/5 hover:bg-[#163323]/10 border border-[#163323]/10 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
              <span className="hidden sm:inline">Gợi ý</span> Vị
            </button>
          )}

          {/* List vs Map Segmented Slider */}
          {onTabChange && (
            <div className="flex p-1 bg-stone-200/50 rounded-xl sm:rounded-full border border-stone-200/60">
              <button
                type="button"
                onClick={() => onTabChange('list')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg sm:rounded-full transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <Grid className="w-3 h-3 text-stone-500" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('map')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg sm:rounded-full transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <MapPin className="w-3 h-3 text-[#C85A32]" />
                <span>Bản đồ</span>
              </button>
            </div>
          )}

          {/* Admin Dashboard Quick Link */}
          <Link
            href="/admin"
            title="Quản trị duyệt quán"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-stone-500" />
            <span>Quản trị</span>
          </Link>

          {/* Nested Button-in-Button: Đóng góp quán mới */}
          <Link
            href="/them-quan"
            className="inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#163323] hover:bg-[#1f4732] active:scale-97 transition-all shadow-sm shadow-[#163323]/20 group"
          >
            <span>Đóng góp quán</span>
            <span className="w-6 h-6 rounded-full bg-white/15 group-hover:bg-[#C85A32] flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5 text-white" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
