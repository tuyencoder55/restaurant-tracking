# Tính năng cốt lõi của web "Sổ tay quán ăn ngon"

Mỗi khi tạo hoặc sửa liên quan đến "quán ăn", luôn nhớ mô hình dữ liệu và tính năng sau
(trừ khi mình yêu cầu thay đổi):

## Một "quán ăn" gồm các thông tin
- Tên quán
- Địa chỉ + toạ độ (lat/lng) để hiển thị trên bản đồ
- Ảnh (một hoặc nhiều ảnh món/quán)
- Đánh giá sao (1-5) + ghi chú cá nhân (món nên gọi, giá cả, cảm nhận...)
- Tag/loại món (ví dụ: bún, lẩu, cafe, ăn vặt...) — cho phép gắn nhiều tag cho 1 quán

## Tính năng chính của web
1. **Danh sách quán ăn**: hiển thị dạng lưới thẻ (card), mỗi thẻ có ảnh đại diện, tên, sao, tag.
2. **Bản đồ**: xem các quán ăn trên bản đồ (dùng skill `ban-do-va-dia-chi`).
3. **Lọc & tìm kiếm**: lọc theo tag, theo số sao, tìm theo tên quán/khu vực.
4. **Trang chi tiết quán**: xem đầy đủ ảnh, ghi chú, địa chỉ, bản đồ nhỏ.
5. **Thêm/sửa quán ăn**: form thêm quán mới (upload ảnh, chọn tag, nhập địa chỉ).

## Định hướng mở rộng sau này (không cần làm ngay, nhưng đừng thiết kế theo cách chặn đường)
- Có thể thêm: đánh dấu "muốn đi", chia sẻ danh sách quán cho bạn bè, thống kê quán đã đi theo tháng.
- Vì vậy khi thiết kế schema Supabase, đặt tên bảng/cột rõ ràng, dễ mở rộng thêm cột mới sau này.
