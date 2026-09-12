# /them-tinh-nang

Dùng khi mình muốn thêm một tính năng mới vào web quán ăn.

Thực hiện theo đúng thứ tự sau, KHÔNG bỏ qua bước nào:

1. **Làm rõ yêu cầu**: Tóm tắt lại bằng 1-2 câu tính năng mình vừa mô tả, và hỏi lại nếu có
   phần chưa rõ (ví dụ: hiển thị ở đâu, ai dùng, cần lưu vào Supabase không).
2. **Lên kế hoạch ngắn**: Liệt kê những file sẽ tạo mới / sửa (component, route, migration
   Supabase nếu có). Không cần dài dòng, 3-6 gạch đầu dòng là đủ.
3. **Kiểm tra ảnh hưởng**: Nếu tính năng đụng tới schema Supabase đã có dữ liệu thật, hỏi xác
   nhận trước khi chạy migration.
4. **Code từng phần nhỏ**: Ưu tiên tạo component/hàm riêng biệt, dễ test độc lập.
5. **Tự kiểm tra**: Chạy thử (`npm run dev`), đảm bảo không có lỗi console/build trước khi báo
   xong việc.
6. **Tóm tắt kết quả**: Báo lại ngắn gọn đã làm gì, cách xem thử trên trình duyệt, có cần cập
   nhật `.env` hoặc chạy migration Supabase không.
