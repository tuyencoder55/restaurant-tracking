---
name: ban-do-va-dia-chi
description: Dùng khi làm tính năng bản đồ hiển thị các quán ăn, hoặc cần chuyển địa chỉ (text) thành toạ độ lat/lng (geocoding) khi thêm quán ăn mới.
---

# Bản đồ & địa chỉ

## Lựa chọn công nghệ (miễn phí, phù hợp project cá nhân)
- **Hiển thị bản đồ**: `react-leaflet` + tile OpenStreetMap. Không cần API key, không giới
  hạn request gắt như Google Maps.
- **Geocoding** (chuyển địa chỉ thành lat/lng): dùng Nominatim (OpenStreetMap) —
  `https://nominatim.openstreetmap.org/search?q={địa chỉ}&format=json`. Miễn phí nhưng có
  giới hạn ~1 request/giây, nên chỉ gọi khi người dùng bấm nút "Tìm toạ độ" trong form thêm
  quán, KHÔNG gọi tự động liên tục khi đang gõ.

## Cách dùng react-leaflet trong Next.js
- `react-leaflet` cần chạy ở client, nên component bản đồ phải có `"use client"` ở đầu file
  và import động (`next/dynamic` với `ssr: false`) khi dùng trong page/component server.
- Style CSS của Leaflet phải được import 1 lần (`import "leaflet/dist/leaflet.css"`), thường
  đặt trong layout gốc hoặc chính component bản đồ.

## Component bản đồ đề xuất
1. `RestaurantsMap`: hiển thị tất cả marker quán ăn trên 1 bản đồ (dùng ở trang danh sách,
   có thể toggle giữa view lưới/bản đồ).
2. `RestaurantMiniMap`: bản đồ nhỏ chỉ 1 marker, dùng ở trang chi tiết quán.
3. Mỗi marker khi bấm vào hiển thị popup nhỏ: tên quán, ảnh đại diện, link sang trang chi tiết.

## Lưu ý khi thêm quán mới
- Cho người dùng nhập địa chỉ dạng text bình thường, có nút "Tìm toạ độ trên bản đồ" để
  gọi Nominatim, sau đó cho phép kéo thả marker chỉnh lại vị trí chính xác nếu geocode sai
  (địa chỉ Việt Nam đôi khi geocode không chính xác 100%).
