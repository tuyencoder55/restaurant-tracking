---
name: upload-va-toi-uu-anh
description: Dùng khi làm tính năng upload ảnh món/quán ăn lên Supabase Storage, hoặc khi cần hiển thị ảnh tối ưu (không load ảnh gốc quá nặng) trên trang danh sách/chi tiết quán ăn.
---

# Upload & tối ưu ảnh quán ăn

## Luồng upload đề xuất
1. Người dùng chọn ảnh trong form thêm quán (input type="file", cho phép chọn nhiều ảnh).
2. Trước khi upload, resize ảnh phía trình duyệt (ví dụ giới hạn cạnh dài nhất ~1600px) để
   tiết kiệm dung lượng Storage và tốc độ tải — dùng canvas API hoặc thư viện nhẹ như
   `browser-image-compression` nếu cần (hỏi mình trước khi thêm thư viện mới).
3. Upload lên Supabase Storage bucket `restaurant-photos`, đường dẫn
   `restaurant-photos/{restaurant_id}/{timestamp}-{tenfile}`.
4. Sau khi upload xong, lưu `photo_url` (public URL) vào bảng `restaurant_photos`.

## Hiển thị ảnh
- Luôn dùng component `next/image` thay vì thẻ `<img>` thường, để Next.js tự tối ưu kích
  thước/định dạng theo từng thiết bị.
- Trang danh sách: chỉ hiển thị 1 ảnh đại diện/quán (ảnh đầu tiên), kích thước nhỏ (thumbnail).
- Trang chi tiết: hiển thị đầy đủ ảnh dạng gallery/lưới, có thể bấm phóng to.
- Luôn có `alt` text mô tả (ví dụ: "Ảnh {tên quán}") cho khả năng tiếp cận (accessibility).

## Lưu ý
- Giới hạn số lượng ảnh mỗi lần upload (ví dụ tối đa 5-6 ảnh) để tránh chậm.
- Validate định dạng file (chỉ .jpg, .png, .webp) và dung lượng tối đa (ví dụ 5MB/ảnh) trước
  khi upload.
