'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  LogOut,
  CheckCircle2,
  Trash2,
  MapPin,
  Clock,
  ExternalLink,
  Plus,
  Loader2,
  ArrowLeft,
  Shield,
  Star,
} from 'lucide-react';
import {
  loginAdminAction,
  logoutAdminAction,
  getAdminRestaurantsAction,
  approveRestaurantAction,
  deleteRestaurantAction,
} from '@/app/actions';
import { Restaurant } from '@/types';
import StarRating from '@/components/StarRating';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dữ liệu quản trị
  const [pendingList, setPendingList] = useState<Restaurant[]>([]);
  const [approvedList, setApprovedList] = useState<Restaurant[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Luôn khoá trang và xoá phiên cũ mỗi lần vào mới hoặc rời khỏi trang Quản trị
  useEffect(() => {
    logoutAdminAction();
    setIsAdmin(false);

    return () => {
      logoutAdminAction();
    };
  }, []);

  // Tải danh sách quán quản trị
  const loadRestaurants = async () => {
    setLoadingData(true);
    try {
      const data = await getAdminRestaurantsAction();
      setPendingList(data.pending);
      setApprovedList(data.approved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  // Đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await loginAdminAction(password);
      if (res.success) {
        setIsAdmin(true);
        setPassword('');
        loadRestaurants();
      } else {
        setLoginError(res.error || 'Mật khẩu không đúng');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    await logoutAdminAction();
    setIsAdmin(false);
    setPendingList([]);
    setApprovedList([]);
  };

  // Duyệt quán
  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await approveRestaurantAction(id);
      if (res.success) {
        const approvedItem = pendingList.find((r) => r.id === id);
        if (approvedItem) {
          setPendingList((prev) => prev.filter((r) => r.id !== id));
          setApprovedList((prev) => [{ ...approvedItem, status: 'approved' }, ...prev]);
        }
      } else {
        alert(res.error || 'Có lỗi khi duyệt quán');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Xoá hoặc từ chối quán
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xoá/từ chối quán "${name}" không?`)) return;

    setActionLoadingId(id);
    try {
      const res = await deleteRestaurantAction(id);
      if (res.success) {
        setPendingList((prev) => prev.filter((r) => r.id !== id));
        setApprovedList((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(res.error || 'Có lỗi khi xoá');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1. MÀN HÌNH ĐĂNG NHẬP ADMIN (KHOÁ MẶC ĐỊNH CHO MỖI LẦN TRUY CẬP)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-7 sm:p-8 border border-stone-200/90 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#163323] text-[#D4A373] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Trấn Tuyên — Quản Trị</h1>
            <p className="text-xs text-stone-500 mt-1">
              Nhập mật khẩu để truy cập danh sách duyệt quán
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Mật khẩu quản trị
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#163323] focus:ring-2 focus:ring-[#163323]/15"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-full bg-[#163323] hover:bg-[#1e442f] text-white font-bold text-sm shadow-md shadow-[#163323]/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay về trang chủ</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD QUẢN TRỊ VIÊN (KHI ĐÃ ĐĂNG NHẬP)
  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-200/60 transition-colors"
              title="Về trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#163323] text-[#D4A373] flex items-center justify-center font-serif font-black text-xs">
                TT
              </div>
              <h1 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <span>Quản trị Trấn Tuyên</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#163323]/10 text-[#163323]">
                  Admin
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/them-quan"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#163323]/10 text-[#163323] hover:bg-[#163323]/15 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm quán</span>
            </Link>

            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-stone-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Tabs: Chờ duyệt vs Đã duyệt */}
        <div className="flex items-center gap-4 mb-6 border-b border-stone-200 pb-3">
          <button
            onClick={() => setActiveTab('pending')}
            type="button"
            className={`flex items-center gap-2 pb-1 font-bold text-sm transition-colors relative cursor-pointer ${
              activeTab === 'pending'
                ? 'text-[#163323]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Chờ duyệt</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                pendingList.length > 0
                  ? 'bg-[#C85A32] text-white'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {pendingList.length}
            </span>
            {activeTab === 'pending' && (
              <span className="absolute -bottom-3 inset-x-0 h-0.5 bg-[#163323] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            type="button"
            className={`flex items-center gap-2 pb-1 font-bold text-sm transition-colors relative cursor-pointer ${
              activeTab === 'approved'
                ? 'text-[#163323]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã duyệt hiển thị</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-600">
              {approvedList.length}
            </span>
            {activeTab === 'approved' && (
              <span className="absolute -bottom-3 inset-x-0 h-0.5 bg-[#163323] rounded-full" />
            )}
          </button>
        </div>

        {/* Danh sách quán */}
        {loadingData ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-[#163323] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-400">Đang tải dữ liệu...</span>
          </div>
        ) : activeTab === 'pending' ? (
          /* TAB 1: CHỜ DUYỆT */
          pendingList.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[2rem] border border-stone-200/80 p-8 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-base text-stone-900">Không có quán nào đang chờ duyệt</h3>
              <p className="text-xs text-stone-500 mt-1">
                Tất cả các quán do cộng đồng đóng góp đã được xử lý xong!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map((res) => {
                const photo =
                  res.cover_photo ||
                  res.photos?.[0]?.photo_url ||
                  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image src={photo} alt={res.name} fill className="object-cover" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200/70">
                            Chờ duyệt
                          </span>
                          {res.tags && res.tags[0] && (
                            <span className="text-xs text-stone-500">
                              • {res.tags[0].name}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base sm:text-lg text-stone-900">
                          {res.name}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-stone-600">
                          <StarRating rating={res.rating} size="sm" />
                          <span>{res.rating}.0 sao</span>
                          {res.price_range && (
                            <>
                              <span>•</span>
                              <span>{res.price_range}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{res.address}</span>
                        </div>

                        {res.note && (
                          <p className="text-xs text-stone-700 italic bg-[#FAF8F5] p-2 rounded-xl mt-1 max-w-xl border border-stone-200/60">
                            &ldquo;{res.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nút hành động của Admin */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <button
                        onClick={() => handleDelete(res.id, res.name)}
                        disabled={actionLoadingId === res.id}
                        className="px-4 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>

                      <button
                        onClick={() => handleApprove(res.id)}
                        disabled={actionLoadingId === res.id}
                        className="px-5 py-2 rounded-full bg-[#163323] hover:bg-[#1f4732] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === res.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373]" />
                        )}
                        <span>Duyệt hiển thị</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* TAB 2: ĐÃ DUYỆT */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedList.map((res) => {
              const photo =
                res.cover_photo ||
                res.photos?.[0]?.photo_url ||
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-stone-100 mb-3 border border-stone-200/60">
                      <Image src={photo} alt={res.name} fill className="object-cover" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{res.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{res.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating rating={res.rating} size="sm" />
                      <span className="text-xs font-semibold text-stone-600">{res.rating}.0</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                    <Link
                      href={`/quan-an/${res.id}`}
                      target="_blank"
                      className="text-xs font-bold text-[#163323] hover:underline flex items-center gap-1"
                    >
                      <span>Xem chi tiết</span>
                      <ExternalLink className="w-3 h-3 text-[#C85A32]" />
                    </Link>

                    <button
                      onClick={() => handleDelete(res.id, res.name)}
                      disabled={actionLoadingId === res.id}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 p-1 cursor-pointer font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xoá</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
