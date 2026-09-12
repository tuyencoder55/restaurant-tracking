'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  UploadCloud,
  X,
  MapPin,
  Check,
  Heart,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Compass,
  Bookmark,
} from 'lucide-react';
import StarRating from '@/components/StarRating';
import { getTags } from '@/lib/restaurants';
import { geocodeAddress } from '@/lib/geocoding';
import { compressImage } from '@/lib/upload';
import { createRestaurantAction, uploadPhotoAction, checkAdminAuthAction } from '@/app/actions';
import { Tag } from '@/types';

export default function AddRestaurantPage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  const [rating, setRating] = useState(5);
  const [priceRange, setPriceRange] = useState('');
  const [note, setNote] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Photos State
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const [tagData, adminStatus] = await Promise.all([
          getTags(),
          checkAdminAuthAction(),
        ]);
        setTags(tagData);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTags(false);
      }
    }
    init();
  }, []);

  // Chuyển địa chỉ thành toạ độ (Geocoding)
  const handleGeocode = async () => {
    if (!address.trim()) return;
    setIsGeocoding(true);
    setGeocodeSuccess(false);

    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        setGeocodeSuccess(true);
      } else {
        alert('Không tìm thấy toạ độ cho địa chỉ này. Bạn có thể thêm quận/huyện hoặc thành phố để chính xác hơn.');
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Chọn ảnh từ máy
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPhotos = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Gửi form lưu quán ăn
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên quán ăn');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ quán');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Upload các ảnh đã chọn
      const uploadedUrls: string[] = [];
      for (const p of photos) {
        try {
          const compressedBlob = await compressImage(p.file);
          const uploadData = new FormData();
          uploadData.append('file', compressedBlob, p.file.name);

          const uploadResult = await uploadPhotoAction(uploadData);
          if (uploadResult.success && uploadResult.url) {
            uploadedUrls.push(uploadResult.url);
          }
        } catch (uploadErr) {
          console.warn('Không thể tải ảnh này lên:', uploadErr);
        }
      }

      // 2. Lưu vào CSDL Supabase
      const result = await createRestaurantAction({
        name: name.trim(),
        address: address.trim(),
        latitude,
        longitude,
        rating,
        note: note.trim() || undefined,
        price_range: priceRange.trim() || undefined,
        google_maps_url: googleMapsUrl.trim() || undefined,
        is_favorite: isFavorite,
        status: autoApprove && isAdmin ? 'approved' : 'pending',
        tag_ids: selectedTagIds,
        photo_urls: uploadedUrls,
      });

      if (result.success) {
        if (result.status === 'pending') {
          setIsSuccess(true);
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        setErrorMessage(result.error || 'Có lỗi xảy ra khi lưu quán');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Màn hình cảm ơn sau khi đóng góp quán
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 border border-stone-200/90 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#163323] text-[#D4A373] flex items-center justify-center mx-auto text-2xl font-serif font-black shadow-sm">
            T・T
          </div>
          <h2 className="text-xl font-extrabold text-stone-900">
            Cảm ơn bạn đã đóng góp!
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Quán ăn <strong>{name}</strong> đã được ghi nhận vào hàng đợi. Quán sẽ được duyệt và sớm xuất hiện trên bản đồ và danh sách công khai của Trấn Tuyên!
          </p>
          <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                setName('');
                setAddress('');
                setLatitude(null);
                setLongitude(null);
                setPriceRange('');
                setNote('');
                setGoogleMapsUrl('');
                setPhotos([]);
                setSelectedTagIds([]);
                setIsSuccess(false);
              }}
              className="flex-1 py-3 px-4 rounded-full border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
            >
              + Gửi thêm quán khác
            </button>
            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-full bg-[#163323] hover:bg-[#1e442f] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center"
            >
              Về trang chủ
            </Link>
          </div>
          {isAdmin && (
            <div className="pt-2 border-t border-stone-100">
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>👉 Tới trang Quản trị để duyệt ngay quán này</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* Top Floating Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/92 backdrop-blur-xl border-b border-stone-200/80">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 h-13 sm:h-15 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 px-2.5 py-1.5 rounded-full hover:bg-stone-200/60 transition-colors shrink-0 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Link>
          <span className="text-xs sm:text-sm font-extrabold text-stone-900 text-center truncate flex-1 px-1">
            {isAdmin ? 'Thêm quán mới (Admin)' : 'Đóng góp quán ăn vào Trấn Tuyên'}
          </span>
          <div className="w-16 hidden sm:block shrink-0" />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-8">
        {/* Banner thông báo chế độ */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-stone-200/90 text-xs text-stone-700 flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="w-8 h-8 rounded-xl bg-[#163323]/10 text-[#163323] flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4 text-[#C85A32]" />
          </div>
          <div className="leading-relaxed">
            {isAdmin ? (
              <span>
                <strong className="text-stone-900 font-bold">Chế độ Quản trị viên:</strong> Bạn có thể bật tuỳ chọn duyệt ngay hoặc để quán vào hàng đợi kiểm tra.
              </span>
            ) : (
              <span>
                <strong className="text-stone-900 font-bold">Góc quán bạn tâm đắc:</strong> Chia sẻ địa chỉ ngon để cùng làm giàu sổ tay ẩm thực. Mọi đóng góp sẽ được duyệt kỹ trước khi lên sóng!
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. Upload ảnh quán ăn */}
          <div className="bg-white rounded-[2rem] p-4.5 sm:p-7 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>📸 Hình ảnh quán & Món ăn</span>
              <span className="text-xs font-normal text-stone-500">(Tối đa 6 ảnh)</span>
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                  <Image src={photo.preview} alt="Xem trước" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-stone-900/70 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-[#163323] text-[#D4A373] px-2 py-0.5 rounded-md font-bold">
                      Ảnh bìa
                    </span>
                  )}
                </div>
              ))}

              {photos.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#163323]/50 bg-[#FAF8F5]/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center group">
                  <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-[#163323] mb-1 transition-colors" />
                  <span className="text-[11px] font-bold text-stone-600 group-hover:text-[#163323]">Chọn ảnh</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 2. Thông tin cơ bản */}
          <div className="bg-white rounded-[2rem] p-4.5 sm:p-7 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h2 className="text-sm font-bold text-stone-900">🍜 Thông tin quán</h2>

            {/* Tên quán */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Tên quán ăn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Phở Bò Bát Đàn, Bánh Mì Huỳnh Hoa..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#163323] focus:ring-2 focus:ring-[#163323]/15"
              />
            </div>

            {/* Địa chỉ + Nút tìm toạ độ (chống tràn trên mobile) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Địa chỉ <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: 49 Bát Đàn, Cửa Đông, Hoàn Kiếm, Hà Nội"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#163323] focus:ring-2 focus:ring-[#163323]/15"
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={isGeocoding || !address.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  {isGeocoding ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#163323]" />
                  ) : (
                    <MapPin className="w-4 h-4 text-[#C85A32]" />
                  )}
                  <span>Tìm toạ độ</span>
                </button>
              </div>

              {/* Thông báo toạ độ */}
              {geocodeSuccess && latitude && longitude && (
                <p className="mt-1.5 text-xs text-emerald-700 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã định vị bản đồ: [{latitude.toFixed(4)}, {longitude.toFixed(4)}]</span>
                </p>
              )}
            </div>

            {/* Đánh giá sao (responsive trên mobile) */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="block text-xs font-semibold text-stone-700 mb-0.5">Đánh giá sao</span>
                <span className="text-xs text-stone-500">Mức độ ngon & hài lòng của bạn</span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={rating}
                  size="lg"
                  interactive
                  onChange={(r) => setRating(r)}
                />
                <span className="font-bold text-sm text-stone-900 w-6">{rating}.0</span>
              </div>
            </div>

            {/* Khoảng giá & Link Google Maps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Khoảng giá (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder="Ví dụ: 35k - 70k"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#163323] focus:ring-2 focus:ring-[#163323]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Link Google Maps (tuỳ chọn)
                </label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#163323] focus:ring-2 focus:ring-[#163323]/15"
                />
              </div>
            </div>

            {/* Đánh dấu Quán ruột */}
            <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/70">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#C85A32] fill-[#C85A32]" />
                <div>
                  <span className="block text-xs font-bold text-stone-900">Quán ruột yêu thích</span>
                  <span className="text-[11px] text-stone-500">Ưu tiên xuất hiện trong mục Góc Quán Tuyển Chọn</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-5 h-5 rounded text-[#C85A32] focus:ring-[#C85A32] border-stone-300 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Thẻ thể loại (Tags) */}
          <div className="bg-white rounded-[2rem] p-4.5 sm:p-7 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
            <h2 className="text-sm font-bold text-stone-900">🏷️ Thể loại / Tag món</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#163323] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Ghi chú cá nhân */}
          <div className="bg-white rounded-[2rem] p-4.5 sm:p-7 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
            <h2 className="text-sm font-bold text-stone-900">📝 Ghi chú cảm nhận & Món nên gọi</h2>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Nước dùng ngọt thanh xương hầm, nên gọi kèm quẩy giòn và trứng trần..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#163323] focus:ring-2 focus:ring-[#163323]/15"
            />
          </div>

          {/* Tuỳ chọn Quản trị viên (nếu Admin đang đăng nhập) */}
          {isAdmin && (
            <div className="bg-[#FAF8F5] border border-stone-300/80 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#163323] mt-0.5 shrink-0" />
              <div className="text-xs flex-1">
                <div className="font-bold text-stone-900 mb-1">Tuỳ chọn Quản trị viên</div>
                <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700 hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="w-4 h-4 rounded text-[#163323] focus:ring-[#163323] border-stone-300 cursor-pointer"
                  />
                  <span>Duyệt & xuất bản ngay lên trang chủ (mặc định bỏ chọn để kiểm tra qua hàng đợi duyệt)</span>
                </label>
              </div>
            </div>
          )}

          {/* Nút Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-[#163323] hover:bg-[#1e442f] text-white font-bold text-sm shadow-md shadow-[#163323]/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi thông tin...</span>
                </>
              ) : autoApprove && isAdmin ? (
                <>
                  <Compass className="w-4 h-4 text-[#D4A373]" />
                  <span>Lưu & Xuất bản ngay lên trang chủ</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-[#D4A373]" />
                  <span>Gửi quán (Chờ Admin duyệt)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
