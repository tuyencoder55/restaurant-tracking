// Kiểu dữ liệu chính cho quán ăn
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  rating: number; // 1 đến 5
  note?: string | null;
  price_range?: string | null; // Ví dụ: "35k - 70k"
  google_maps_url?: string | null;
  is_favorite?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  distance?: number; // Khoảng cách tính bằng km từ toạ độ người dùng
  created_at?: string;
  tags?: Tag[];
  photos?: RestaurantPhoto[];
  cover_photo?: string | null;
}

// Thẻ tag / phân loại món
export interface Tag {
  id: string;
  name: string;
}

// Bảng nối quán ăn và tag
export interface RestaurantTag {
  restaurant_id: string;
  tag_id: string;
}

// Ảnh của quán ăn
export interface RestaurantPhoto {
  id: string;
  restaurant_id?: string;
  photo_url: string;
  is_cover: boolean;
  photo_type?: 'food' | 'menu';
  created_at?: string;
}

// Dữ liệu khi tạo mới / cập nhật quán ăn
export interface RestaurantFormData {
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  rating: number;
  note?: string;
  price_range?: string;
  google_maps_url?: string;
  is_favorite?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  tag_ids: string[];
  photo_urls: string[]; // Ảnh món ăn & không gian quán
  menu_photo_urls?: string[]; // Ảnh Menu / Bảng giá quán
}
