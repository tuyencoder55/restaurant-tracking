---
name: thiet-ke-giao-dien
description: Dùng khi tạo hoặc chỉnh giao diện (component UI, layout, màu sắc, spacing) cho web quán ăn. Mình là designer nên chú trọng phần này — luôn ưu tiên gợi ý bố cục rõ ràng, đẹp, nhất quán thay vì chỉ code cho chạy được.
---

# Định hướng thiết kế giao diện

## Nguyên tắc chung
- Vì mình là designer, có thể đưa ra góp ý/đề xuất về UI (không chỉ làm đúng y yêu cầu chức
  năng), nhưng luôn hỏi trước khi tự ý thay đổi phong cách thị giác đã có.
- Ưu tiên khoảng trắng (whitespace) thoáng, chữ dễ đọc, ảnh là yếu tố chính (vì đây là web
  về ăn uống — ảnh món ăn phải nổi bật).
- Dùng Tailwind CSS, tránh viết CSS tuỳ chỉnh (custom CSS) trừ khi Tailwind không đáp ứng được.

## Các thành phần UI chính cần nhất quán
1. **RestaurantCard** (thẻ quán ăn): ảnh (tỉ lệ 4:3 hoặc 1:1), tên quán, sao đánh giá (icon
   sao, không dùng số suông), 2-3 tag hiển thị dạng chip nhỏ bo tròn.
2. **Bộ lọc tag**: dạng chip có thể bấm chọn/bỏ chọn (toggle), không dùng dropdown ẩn nếu
   danh sách tag ngắn (<10 tag).
3. **Sao đánh giá**: dùng component tái sử dụng `StarRating`, hỗ trợ chế độ chỉ-xem (readonly)
   và chế độ chọn (interactive, dùng trong form thêm/sửa).
4. **Trang chi tiết quán**: bố cục 2 cột trên desktop (ảnh/bản đồ bên trái, thông tin/ghi chú
   bên phải), xếp dọc trên mobile.

## Màu sắc & không khí (mood)
- Mặc định dùng tông ấm, gần gũi (be, cam đất, nâu) phù hợp chủ đề ẩm thực — nhưng đây chỉ là
  gợi ý mặc định, nếu mình có bảng màu riêng thì ưu tiên theo mình.
- Tránh giao diện quá "công nghiệp"/kiểu dashboard admin — đây là sổ tay cá nhân, nên có thể
  thân thiện, có chút "ấm" (ví dụ bo góc mềm mại `rounded-2xl`, đổ bóng nhẹ).

## Mobile-first
- Luôn thiết kế/code cho màn hình điện thoại trước, sau đó mở rộng cho tablet/desktop bằng
  breakpoint Tailwind (`sm:`, `md:`, `lg:`).
