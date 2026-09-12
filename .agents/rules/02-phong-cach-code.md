# Phong cách code & cách làm việc

Mình là designer, biết code ở mức không chuyên (vibe coding). Vì vậy:

## Code
- Viết code NGẮN GỌN, RÕ RÀNG, chia nhỏ theo component. Tránh 1 file quá dài (>200 dòng thì
  nên tách nhỏ).
- Luôn có comment ngắn bằng tiếng Việt ở những đoạn logic không hiển nhiên (giải thích "tại sao"
  chứ không phải lặp lại code đang làm gì).
- Đặt tên biến/hàm/component bằng tiếng Anh, rõ nghĩa (ví dụ: `RestaurantCard`, `getRestaurants`).
- Không thêm thư viện mới nếu không thực sự cần thiết. Nếu thấy cần thêm 1 package, hãy nói rõ
  lý do trước khi cài.
- Không tự ý đổi cấu trúc thư mục đã có mà không giải thích.

## Khi trả lời / khi code xong
- Sau khi hoàn thành một tính năng, tóm tắt ngắn gọn (3-5 gạch đầu dòng, tiếng Việt):
  đã tạo/sửa file nào, cần chạy lệnh gì để test, có cần thêm biến môi trường (.env) không.
- Nếu có lỗi xảy ra, giải thích nguyên nhân bằng ngôn ngữ đơn giản, không dùng thuật ngữ
  chuyên sâu mà không giải thích kèm.
- Nếu một yêu cầu có rủi ro (ví dụ: xoá dữ liệu, thay đổi schema Supabase đang có dữ liệu),
  cảnh báo trước khi thực hiện.

## Bảo mật cơ bản
- Không bao giờ commit file `.env` hoặc để lộ API key/secret key trong code.
- Chỉ dùng Supabase "anon public key" ở phía client. Các thao tác nhạy cảm (nếu có) đặt trong
  Next.js server actions / route handlers, không đưa "service role key" ra client.
