'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, X, RotateCcw, MapPin, ArrowRight, Star, Quote } from 'lucide-react';
import { Restaurant } from '@/types';

interface RandomModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
}

export default function RandomModal({ isOpen, onClose, restaurants }: RandomModalProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const pickRandom = () => {
    if (!restaurants || restaurants.length === 0) return;
    setIsSpinning(true);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setSelectedRestaurant(restaurants[randomIndex]);
      counter++;

      if (counter > 14) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 70);
  };

  useEffect(() => {
    if (isOpen && restaurants.length > 0) {
      pickRandom();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#163323]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border border-[#163323]/15 overflow-hidden">
        {/* Subtle background ambient gold */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#D4A373]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/70 rounded-full transition-colors cursor-pointer z-20"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#163323]/10 text-[#163323] text-xs font-bold mb-2">
            <Compass className={`w-3.5 h-3.5 text-[#C85A32] ${isSpinning ? 'animate-spin' : ''}`} />
            <span>La Bàn Ẩm Thực</span>
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            {isSpinning ? 'Đang xáo trộn vị giác...' : 'Điểm đến hôm nay dành cho bạn!'}
          </h2>
        </div>

        {/* Result Card */}
        {selectedRestaurant && (
          <div className={`transition-all duration-300 ${isSpinning ? 'opacity-60 scale-98 blur-[1px]' : 'opacity-100 scale-100'}`}>
            {/* Image */}
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200/80 mb-4">
              <Image
                src={
                  selectedRestaurant.cover_photo ||
                  selectedRestaurant.photos?.[0]?.photo_url ||
                  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
                }
                alt={selectedRestaurant.name}
                fill
                className="object-cover"
              />

              {/* Badges on image */}
              <div className="absolute top-2.5 right-2.5 bg-[#163323]/90 backdrop-blur-md text-[#D4A373] text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                <Star className="w-3.5 h-3.5 fill-[#D4A373]" />
                <span>{selectedRestaurant.rating}.0</span>
              </div>

              {selectedRestaurant.price_range && (
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10">
                  {selectedRestaurant.price_range}
                </div>
              )}
            </div>

            {/* Restaurant Name */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-extrabold text-lg text-stone-900 line-clamp-1">
                {selectedRestaurant.name}
              </h3>
              {selectedRestaurant.tags && selectedRestaurant.tags[0] && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#163323] border border-stone-200/80 shrink-0">
                  {selectedRestaurant.tags[0].name}
                </span>
              )}
            </div>

            {/* Address */}
            <div className="flex items-start gap-1.5 text-xs text-stone-600 mb-3 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>{selectedRestaurant.address}</span>
            </div>

            {/* Note */}
            {selectedRestaurant.note && (
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/70 text-xs text-stone-700 mb-5 italic flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
                <span>&ldquo;{selectedRestaurant.note}&rdquo;</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={pickRandom}
                disabled={isSpinning}
                className="flex-1 py-3 px-4 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-stone-500 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>Quay vị khác</span>
              </button>

              <Link
                href={`/quan-an/${selectedRestaurant.id}`}
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-full bg-[#163323] hover:bg-[#1f4732] text-white font-bold text-xs shadow-md shadow-[#163323]/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Xem chi tiết quán</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
