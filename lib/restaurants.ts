import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { Restaurant, RestaurantFormData, RestaurantPhoto, Tag } from '@/types';
import { INITIAL_RESTAURANTS, INITIAL_TAGS } from '@/lib/mock-data';

// 1. LẤY DANH SÁCH TẤT CẢ QUÁN ĂN (KÈM TAG & ẢNH ĐẠI DIỆN)
export async function getRestaurants(): Promise<Restaurant[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_RESTAURANTS;
  }

  try {
    const { data, error } = await supabase
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
        restaurant_photos (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Lỗi khi tải quán ăn từ Supabase, chuyển sang dữ liệu mẫu:', error.message);
      return INITIAL_RESTAURANTS;
    }

    if (!data || data.length === 0) {
      return INITIAL_RESTAURANTS;
    }

    // Chỉ hiển thị các quán đã được duyệt (approved) hoặc chưa có trường status ra trang chủ công khai
    const publicData = data.filter((item: any) => item.status !== 'pending' && item.status !== 'rejected');

    // Định dạng lại cấu trúc phẳng cho dễ dùng
    return publicData.map((item: any) => {
      const tags: Tag[] = item.restaurant_tags?.map((rt: any) => rt.tags).filter(Boolean) || [];
      const photos: RestaurantPhoto[] = (item.restaurant_photos || []).map((p: any) => ({
        id: p.id,
        restaurant_id: item.id,
        photo_url: p.photo_url,
        is_cover: p.is_cover || false,
        photo_type: p.photo_type || (p.photo_url?.includes('menu_') ? 'menu' : 'food'),
      }));
      const coverPhoto = photos.find((p) => p.is_cover)?.photo_url || photos.find((p) => p.photo_type !== 'menu')?.photo_url || photos[0]?.photo_url || null;

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
  } catch (err) {
    console.error('Lỗi kết nối Supabase:', err);
    return INITIAL_RESTAURANTS;
  }
}

// 2. LẤY CHI TIẾT 1 QUÁN ĂN THEO ID
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  if (!isSupabaseConfigured) {
    return INITIAL_RESTAURANTS.find((r) => r.id === id) || null;
  }

  try {
    const { data, error } = await supabase
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
        restaurant_photos (*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return INITIAL_RESTAURANTS.find((r) => r.id === id) || null;
    }

    const tags: Tag[] = data.restaurant_tags?.map((rt: any) => rt.tags).filter(Boolean) || [];
    const photos: RestaurantPhoto[] = (data.restaurant_photos || []).map((p: any) => ({
      id: p.id,
      restaurant_id: data.id,
      photo_url: p.photo_url,
      is_cover: p.is_cover || false,
      photo_type: p.photo_type || (p.photo_url?.includes('menu_') ? 'menu' : 'food'),
    }));
    const coverPhoto = photos.find((p) => p.is_cover)?.photo_url || photos.find((p) => p.photo_type !== 'menu')?.photo_url || photos[0]?.photo_url || null;

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      rating: data.rating,
      note: data.note,
      price_range: data.price_range,
      google_maps_url: data.google_maps_url,
      is_favorite: data.is_favorite,
      created_at: data.created_at,
      tags,
      photos,
      cover_photo: coverPhoto,
    };
  } catch (err) {
    return INITIAL_RESTAURANTS.find((r) => r.id === id) || null;
  }
}

// 3. LẤY TẤT CẢ DANH SÁCH THẺ TAG
export async function getTags(): Promise<Tag[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_TAGS;
  }

  try {
    const { data, error } = await supabase.from('tags').select('id, name').order('name');
    if (error || !data || data.length === 0) {
      return INITIAL_TAGS;
    }
    return data;
  } catch {
    return INITIAL_TAGS;
  }
}

// 4. THÊM QUÁN ĂN MỚI
export async function createRestaurant(formData: RestaurantFormData): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      id: `local-${Date.now()}`,
    };
  }

  try {
    const serverSupabase = createServerClient();

    // Thêm bản ghi quán ăn
    const { data: newRestaurant, error: insertError } = await serverSupabase
      .from('restaurants')
      .insert({
        name: formData.name,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        rating: formData.rating,
        note: formData.note,
        price_range: formData.price_range,
        google_maps_url: formData.google_maps_url,
        is_favorite: formData.is_favorite || false,
      })
      .select('id')
      .single();

    if (insertError || !newRestaurant) {
      return { success: false, error: insertError?.message || 'Không thể lưu quán ăn' };
    }

    const restaurantId = newRestaurant.id;

    // Gắn thẻ tag
    if (formData.tag_ids && formData.tag_ids.length > 0) {
      const tagRows = formData.tag_ids.map((tagId) => ({
        restaurant_id: restaurantId,
        tag_id: tagId,
      }));
      await serverSupabase.from('restaurant_tags').insert(tagRows);
    }

    // Thêm ảnh quán
    if (formData.photo_urls && formData.photo_urls.length > 0) {
      const photoRows = formData.photo_urls.map((url, idx) => ({
        restaurant_id: restaurantId,
        photo_url: url,
        is_cover: idx === 0,
      }));
      await serverSupabase.from('restaurant_photos').insert(photoRows);
    }

    return { success: true, id: restaurantId };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Đã có lỗi xảy ra khi thêm quán ăn' };
  }
}
