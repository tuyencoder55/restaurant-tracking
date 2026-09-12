'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface ImageLightboxProps {
  photos: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ImageLightbox({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch swipe support for mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Sync initialIndex when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Reset zoom when switching photos
  const handlePrev = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Zoom controls
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Toggle 1x / 2x on double click
  const handleDoubleClick = () => {
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2);
    }
  };

  // Dragging logic when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale === 1 && e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    } else if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (scale === 1 && touchStartXRef.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartXRef.current - touchEndX;
      const diffY = (touchStartYRef.current || 0) - touchEndY;

      // Only trigger swipe if horizontal swipe is prominent
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      touchStartXRef.current = null;
      touchStartYRef.current = null;
    }
  };

  if (!isOpen || !photos.length) return null;

  const currentPhotoUrl = photos[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-stone-950/60 backdrop-blur-md border-b border-white/10 z-20">
        <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-medium">
          <span className="bg-white/15 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider">
            {currentIndex + 1} / {photos.length}
          </span>
          {currentPhotoUrl?.includes('menu_') ? (
            <span className="bg-[#C85A32] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
              📋 Menu
            </span>
          ) : (
            <span className="bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
              🍜 Món & Quán
            </span>
          )}
          {title && (
            <span className="hidden sm:inline-block text-stone-300 truncate max-w-xs font-semibold">
              {title}
            </span>
          )}
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/15 transition-colors disabled:opacity-40 cursor-pointer"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {scale > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Khôi phục kích thước 100%"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Open Raw Image in New Tab */}
          <a
            href={currentPhotoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            title="Mở ảnh gốc chất lượng cao"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          {/* Close Lightbox */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 ml-1 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white text-stone-200 transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage (100% Uncropped View) */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-white/15 transition-all shadow-xl hover:scale-105 cursor-pointer"
            title="Ảnh trước (Mũi tên trái)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* The Image Itself - 100% full view without cropping */}
        <div
          className={`relative max-w-full max-h-full transition-transform duration-100 ease-out ${
            scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhotoUrl}
            alt={title || `Ảnh ${currentIndex + 1}`}
            className="max-w-[95vw] sm:max-w-[90vw] max-h-[75vh] sm:max-h-[82vh] object-contain rounded-lg shadow-2xl transition-all"
            draggable={false}
          />
        </div>

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-white/15 transition-all shadow-xl hover:scale-105 cursor-pointer"
            title="Ảnh tiếp theo (Mũi tên phải)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Instruction pill at bottom center */}
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <span className="text-[11px] font-medium bg-stone-900/80 text-stone-300 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg whitespace-nowrap">
            {scale > 1 ? 'Kéo để di chuyển • Nhấp đúp để đặt lại' : 'Nhấp đúp hoặc dùng nút để phóng to xem nét'}
          </span>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="px-4 py-2.5 bg-stone-950/70 backdrop-blur-md border-t border-white/10 z-20 flex justify-center items-center gap-2 overflow-x-auto scrollbar-none">
          {photos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
                setCurrentIndex(idx);
              }}
              className={`relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-[#D4A373] scale-105 shadow-md shadow-amber-500/20'
                  : 'border-white/20 opacity-50 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              {url.includes('menu_') && (
                <span className="absolute bottom-0 inset-x-0 bg-[#C85A32]/90 text-[8px] text-white text-center font-bold uppercase leading-tight py-0.5">
                  Menu
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
