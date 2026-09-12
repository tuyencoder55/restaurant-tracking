'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { Restaurant, RestaurantFormData, RestaurantPhoto, Tag } from '@/types';

// ==========================================
// 1. ADMIN AUTHENTICATION (ĐƠN GIẢN & AN TOÀN QUA COOKIE)
// ==========================================

const ADMIN_COOKIE_NAME = 'admin_session';

// Đăng nhập Admin bằng mật khẩu đơn giản
export async function loginAdminAction(password: string): Promise<{ success: boolean; error?: string }> {
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!password || password.trim() !== correctPassword) {
    return { success: false, error: 'Mật khẩu quản trị không đúng' };
  }

  // Phiên đăng nhập tạm thời trong trình duyệt, không lưu dài hạn
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return { success: true };
}

// Đăng xuất Admin
export async function logoutAdminAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return { success: true };
}

// Kiểm tra trạng thái đăng nhập Admin
export async function checkAdminAuthAction(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session?.value === 'authenticated_token';
}

// ==========================================
// 2. TẢI ẢNH LÊN SUPABASE STORAGE
// ==========================================

export async function uploadPhotoAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'Không tìm thấy file tải lên' };
    }

    const serverSupabase = createServerClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await serverSupabase.storage
      .from('restaurant-photos')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('Lỗi upload ảnh phía server:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data } = serverSupabase.storage
      .from('restaurant-photos')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (err: any) {
    console.error('Lỗi trong uploadPhotoAction:', err);
    return { success: false, error: err?.message || 'Lỗi xử lý ảnh phía server' };
  }
}

// ==========================================
// 3. THÊM QUÁN ĂN (CỘNG ĐỒNG ĐÓNG GÓP HOẶC ADMIN TỰ THÊM)
// ==========================================

export async function createRestaurantAction(
  formData: RestaurantFormData
): Promise<{ success: boolean; id?: string; error?: string; status?: string }> {
  try {
    const serverSupabase = createServerClient();
    const isAdmin = await checkAdminAuthAction();

    // Mặc định cho mọi lượt nhập quán (kể cả khi Admin đang đăng nhập) là 'pending' (chờ duyệt).
    // Chỉ tự động 'approved' nếu Admin chủ động bật tuỳ chọn duyệt ngay (status === 'approved')
    const initialStatus = (formData.status === 'approved' && isAdmin) ? 'approved' : 'pending';

    // 1. Thêm quán (hỗ trợ tự động fallback nếu người dùng chưa kịp chạy câu lệnh thêm cột status)
    let newRestaurantId = '';
    let appliedStatus = initialStatus;

    const basePayload: any = {
      name: formData.name,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      rating: formData.rating,
      note: formData.note,
      price_range: formData.price_range,
      google_maps_url: formData.google_maps_url,
      is_favorite: formData.is_favorite || false,
    };

    // Thử insert có trường status
    const { data: resWithStatus, error: statusInsertError } = await serverSupabase
      .from('restaurants')
      .insert({ ...basePayload, status: initialStatus })
      .select('id')
      .single();

    if (statusInsertError) {
      // Nếu cột status chưa có trong DB, tự động insert bình thường không có status
      const { data: resWithoutStatus, error: fallbackError } = await serverSupabase
        .from('restaurants')
        .insert(basePayload)
        .select('id')
        .single();

      if (fallbackError || !resWithoutStatus) {
        return { success: false, error: fallbackError?.message || statusInsertError.message };
      }
      newRestaurantId = resWithoutStatus.id;
      appliedStatus = 'approved';
    } else if (resWithStatus) {
      newRestaurantId = resWithStatus.id;
    }

    const restaurantId = newRestaurantId;

    // 2. Gắn tags
    if (formData.tag_ids && formData.tag_ids.length > 0) {
      const tagRows = formData.tag_ids.map((tagId) => ({
        restaurant_id: restaurantId,
        tag_id: tagId,
      }));
      await serverSupabase.from('restaurant_tags').insert(tagRows);
    }

    // 3. Lưu ảnh
    if (formData.photo_urls && formData.photo_urls.length > 0) {
      const photoRows = formData.photo_urls.map((url, idx) => ({
        restaurant_id: restaurantId,
        photo_url: url,
        is_cover: idx === 0,
      }));
      await serverSupabase.from('restaurant_photos').insert(photoRows);
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, id: restaurantId, status: initialStatus };
  } catch (err: any) {
    console.error('Lỗi trong createRestaurantAction:', err);
    return { success: false, error: err?.message || 'Lỗi máy chủ khi lưu quán ăn' };
  }
}

// ==========================================
// 4. CÁC HÀNH ĐỘNG QUẢN TRỊ (ADMIN QUEUE & ACTIONS)
// ==========================================

// Lấy danh sách quán cho trang quản trị (hỗ trợ phân loại pending và approved)
export async function getAdminRestaurantsAction(): Promise<{
  pending: Restaurant[];
  approved: Restaurant[];
}> {
  const isAdmin = await checkAdminAuthAction();
  if (!isAdmin) {
    return { pending: [], approved: [] };
  }

  try {
    const serverSupabase = createServerClient();
    const { data, error } = await serverSupabase
      .from('restaurants')
      .select(`
        id,
        name,
        address,
        latitude,
        longitude,
        rating,
        note,
        price_range,
        google_maps_url,
        is_favorite,
        status,
        created_at,
        restaurant_tags (
          tags (
            id,
            name
          )
        ),
        restaurant_photos (
          id,
          photo_url,
          is_cover
        )
      `)
    let rawData: any[] = data || [];
    if (error) {
      const fallbackQuery = await serverSupabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          latitude,
          longitude,
          rating,
          note,
          price_range,
          google_maps_url,
          is_favorite,
          created_at,
          restaurant_tags (
            tags (
              id,
              name
            )
          ),
          restaurant_photos (
            id,
            photo_url,
            is_cover
          )
        `)
        .order('created_at', { ascending: false });
      rawData = (fallbackQuery.data || []).map((item: any) => ({ ...item, status: 'approved' }));
    }

    if (!rawData) {
      return { pending: [], approved: [] };
    }

    const allFormatted: Restaurant[] = rawData.map((item: any) => {
      const tags: Tag[] = item.restaurant_tags?.map((rt: any) => rt.tags).filter(Boolean) || [];
      const photos: RestaurantPhoto[] = (item.restaurant_photos || []).map((p: any) => ({
        id: p.id,
        restaurant_id: item.id,
        photo_url: p.photo_url,
        is_cover: p.is_cover || false,
      }));
      const coverPhoto = photos.find((p) => p.is_cover)?.photo_url || photos[0]?.photo_url || null;

      return {
        id: item.id,
        name: item.name,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        rating: item.rating,
        note: item.note,
        price_range: item.price_range,
        google_maps_url: item.google_maps_url,
        is_favorite: item.is_favorite,
        status: item.status || 'approved',
        created_at: item.created_at,
        tags,
        photos,
        cover_photo: coverPhoto,
      };
    });

    return {
      pending: allFormatted.filter((r) => r.status === 'pending'),
      approved: allFormatted.filter((r) => r.status !== 'pending'),
    };
  } catch (err) {
    console.error('Lỗi khi getAdminRestaurantsAction:', err);
    return { pending: [], approved: [] };
  }
}

// Duyệt quán ăn (Approve -> Hiện lên trang chủ)
export async function approveRestaurantAction(id: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminAuthAction();
  if (!isAdmin) {
    return { success: false, error: 'Chưa được cấp quyền quản trị' };
  }

  try {
    const serverSupabase = createServerClient();
    const { error } = await serverSupabase
      .from('restaurants')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi duyệt quán' };
  }
}

// Xoá hoặc từ chối quán ăn
export async function deleteRestaurantAction(id: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminAuthAction();
  if (!isAdmin) {
    return { success: false, error: 'Chưa được cấp quyền quản trị' };
  }

  try {
    const serverSupabase = createServerClient();
    const { error } = await serverSupabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi xoá quán' };
  }
}
