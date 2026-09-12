'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SpotlightSection from '@/components/SpotlightSection';
import FilterBar from '@/components/FilterBar';
import RestaurantCard from '@/components/RestaurantCard';
import RandomModal from '@/components/RandomModal';
import RestaurantsMap from '@/components/map/RestaurantsMap';
import { getRestaurants, getTags } from '@/lib/restaurants';
import { Restaurant, Tag } from '@/types';
import { AlertCircle, RotateCcw, ChevronRight, Loader2 } from 'lucide-react';
import { INITIAL_RESTAURANTS, INITIAL_TAGS } from '@/lib/mock-data';
import { calculateDistance } from '@/lib/distance';

// Toạ độ tham chiếu mặc định: Trung tâm TP. Hồ Chí Minh
const DEFAULT_CENTER = {
  latitude: 10.7769,
  longitude: 106.7009,
  name: 'trung tâm TP. Hồ Chí Minh',
};

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [loading, setLoading] = useState(false);

  // Trạng thái tìm kiếm và bộ lọc đa tiêu chí
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'near' | 'newest' | 'rating' | 'favorite'>('near');

  // Trạng thái định vị GPS
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Chế độ xem: 'list' (danh sách thẻ) hoặc 'map' (bản đồ toàn bộ)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');

  // Trạng thái mở modal Random
  const [isRandomOpen, setIsRandomOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [resList, tagList] = await Promise.all([getRestaurants(), getTags()]);
        if (resList && resList.length > 0) {
          setRestaurants(resList);
        }
        if (tagList && tagList.length > 0) {
          setTags(tagList);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Tự động trích xuất danh sách quận/huyện từ địa chỉ các quán
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => {
      const addr = r.address;
      const match = addr.match(
        /(Quận\s+\d+|Quận\s+[\p{L}\s]+|Huyện\s+[\p{L}\s]+|Bình Thạnh|Gò Vấp|Phú Nhuận|Tân Bình|Tân Phú|Thủ Đức|Nhà Bè|Hóc Môn|Bình Chánh|Hoàn Kiếm|Ba Đình|Đống Đa|Hai Bà Trưng|Cầu Giấy|Thanh Xuân|Đà Lạt)/iu
      );
      if (match) {
        set.add(match[0].trim());
      }
    });
    return Array.from(set).sort();
  }, [restaurants]);

  // Xử lý cập nhật toạ độ GPS chính xác của người dùng
  const handleUpdateLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ chức năng định vị GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(coords);
        setSortBy('near');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        let msg = 'Không thể lấy vị trí hiện tại. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Bạn đã từ chối quyền truy cập vị trí. Hãy bật quyền vị trí trong cài đặt trình duyệt để tìm quán gần bạn.';
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Đặt lại tất cả bộ lọc
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTagId(null);
    setSelectedDistrict('');
    setMinRating(null);
    setSortBy('near');
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedTagId || selectedDistrict || minRating !== null || sortBy !== 'near'
  );

  // Lọc danh sách theo các điều kiện và gắn cự ly
  const filteredRestaurants = useMemo(() => {
    // Điểm tham chiếu toạ độ: Ưu tiên GPS người dùng, nếu chưa có thì dùng trung tâm TP.HCM
    const refLat = userLocation ? userLocation.latitude : DEFAULT_CENTER.latitude;
    const refLon = userLocation ? userLocation.longitude : DEFAULT_CENTER.longitude;

    // 1. Tính toán khoảng cách
    const listWithDistance = restaurants.map((restaurant) => {
      if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
        const distance = calculateDistance(
          refLat,
          refLon,
          restaurant.latitude,
          restaurant.longitude
        );
        return { ...restaurant, distance };
      }
      return restaurant;
    });

    // 2. Lọc theo các tiêu chí
    const filtered = listWithDistance.filter((restaurant) => {
      // Lọc từ khoá
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = restaurant.name.toLowerCase().includes(query);
        const matchAddress = restaurant.address.toLowerCase().includes(query);
        const matchNote = restaurant.note?.toLowerCase().includes(query) || false;
        const matchTag = restaurant.tags?.some((t) => t.name.toLowerCase().includes(query)) || false;

        if (!matchName && !matchAddress && !matchNote && !matchTag) {
          return false;
        }
      }

      // Lọc loại món
      if (selectedTagId) {
        const hasTag = restaurant.tags?.some((t) => t.id === selectedTagId);
        if (!hasTag) return false;
      }

      // Lọc khu vực
      if (selectedDistrict) {
        if (!restaurant.address.toLowerCase().includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }

      // Lọc đánh giá
      if (minRating && restaurant.rating < minRating) {
        return false;
      }

      // Lọc sắp xếp theo quán ruột
      if (sortBy === 'favorite' && !restaurant.is_favorite) {
        return false;
      }

      return true;
    });

    // 3. Sắp xếp theo lựa chọn
    return [...filtered].sort((a, b) => {
      if (sortBy === 'near') {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return 0;
      }

      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }

      if (sortBy === 'favorite') {
        return (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0);
      }

      return 0;
    });
  }, [
    restaurants,
    searchQuery,
    selectedTagId,
    selectedDistrict,
    minRating,
    sortBy,
    userLocation,
  ]);

  const favoriteCount = useMemo(() => {
    return restaurants.filter((r) => r.is_favorite).length;
  }, [restaurants]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Header thanh điều hướng Floating Island */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenRandom={() => setIsRandomOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Banner giới thiệu Hero */}
        <HeroSection
          totalCount={restaurants.length}
          favoriteCount={favoriteCount}
          onOpenRandom={() => setIsRandomOpen(true)}
          onViewMap={() => setActiveTab('map')}
          onSelectMoodTag={(query) => {
            setSearchQuery(query);
            setActiveTab('list');
          }}
        />

        {/* Hàng Spotlight quán ruột tuyển chọn */}
        {activeTab === 'list' && !searchQuery && !selectedTagId && (
          <SpotlightSection restaurants={restaurants} />
        )}

        {/* Khu vực danh sách chính: Quán đáng thử gần bạn */}
        <section className="mb-14">
          {/* Section Header chuẩn theo thiết kế ảnh mẫu */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#163323] mb-1.5 flex items-center gap-1.5">
                <span>ĂN NGON KHÔNG CẦN ĐI XA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Quán đáng thử <span className="font-serif italic font-normal text-[#C85A32]">gần bạn</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {userLocation
                  ? 'Khoảng cách đang được tính từ vị trí định vị hiện tại của bạn.'
                  : 'Khoảng cách đang được tính từ trung tâm TP. Hồ Chí Minh.'}
              </p>
            </div>

            {/* Thẻ nút cập nhật vị trí */}
            <button
              type="button"
              onClick={handleUpdateLocation}
              disabled={isLocating}
              className="group flex items-center gap-3 px-4 py-2.5 bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#163323]/50 hover:shadow-md transition-all cursor-pointer text-left shrink-0 self-start md:self-auto"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 relative shrink-0">
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C85A32]" />
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="absolute w-5 h-5 rounded-full bg-red-400/30 animate-ping" />
                  </>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900 group-hover:text-[#163323] flex items-center gap-1">
                  {isLocating ? 'Đang định vị...' : 'Cập nhật vị trí'}
                </div>
                <div className="text-[11px] text-stone-500">
                  {userLocation ? 'Đã bật GPS chính xác' : 'Tìm quán gần nhất'}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 group-hover:text-stone-700 transition-all ml-1" />
            </button>
          </div>

          {/* Thanh tìm kiếm và bộ lọc đa tiêu chí theo ảnh mẫu */}
          <FilterBar
            tags={tags}
            selectedTagId={selectedTagId}
            onSelectTag={setSelectedTagId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            availableDistricts={availableDistricts}
            minRating={minRating}
            onSelectMinRating={setMinRating}
            sortBy={sortBy}
            onSelectSortBy={setSortBy}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Nội dung theo Tab: Danh sách thẻ (4 cột) hoặc Bản đồ */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-72 rounded-3xl bg-stone-100 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : activeTab === 'map' ? (
            <div>
              <RestaurantsMap restaurants={filteredRestaurants} userLocation={userLocation} />
            </div>
          ) : (
            <>
              {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredRestaurants.map((res) => (
                    <RestaurantCard key={res.id} restaurant={res} />
                  ))}
                </div>
              ) : (
                /* Khi không tìm thấy quán nào */
                <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#163323]/5 text-[#163323] flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-stone-900 mb-1">
                    Chưa tìm thấy quán ăn nào phù hợp
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mb-4">
                    Thử điều chỉnh từ khoá hoặc chọn lại các tiêu chí lọc để xem thêm quán nhé!
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#163323] bg-[#163323]/10 hover:bg-[#163323]/15 rounded-full transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xoá tất cả bộ lọc</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200/70 bg-white/70 backdrop-blur-xs py-8 text-center text-xs text-stone-500">
        <p className="font-medium">
          Trấn Tuyên — Sổ tay lưu giữ hương vị và những góc quán yêu thích của bạn
        </p>
        <p className="text-[11px] text-stone-400 mt-1">
          Dữ liệu được lưu trữ an toàn & liên tục cập nhật bởi cộng đồng
        </p>
      </footer>

      {/* Modal Random quay quán ăn */}
      <RandomModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
        restaurants={restaurants}
      />
    </div>
  );
}
