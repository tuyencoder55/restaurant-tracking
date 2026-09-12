import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

// Nén và giảm kích thước ảnh bằng Canvas API trước khi upload (giữ độ nét cao cho menu/chữ)
export async function compressImage(file: File, maxWidth = 2048, quality = 0.88): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}

// Upload ảnh lên Supabase Storage bucket 'restaurant-photos'
export async function uploadRestaurantPhoto(file: File): Promise<string> {
  // Nếu chưa cấu hình Supabase, dùng URL tạm thời từ trình duyệt
  if (!isSupabaseConfigured) {
    return URL.createObjectURL(file);
  }

  try {
    // 1. Nén ảnh
    const compressedBlob = await compressImage(file);

    // 2. Đặt tên file chuẩn: timestamp-tenfile.webp
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${Date.now()}-${cleanFileName}.webp`;

    // 3. Tải lên bucket
    const { error: uploadError } = await supabase.storage
      .from('restaurant-photos')
      .upload(filePath, compressedBlob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Lỗi upload ảnh lên Storage:', uploadError.message);
      return URL.createObjectURL(file);
    }

    // 4. Lấy Public URL
    const { data } = supabase.storage
      .from('restaurant-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Lỗi trong quá trình xử lý ảnh:', err);
    return URL.createObjectURL(file);
  }
}
