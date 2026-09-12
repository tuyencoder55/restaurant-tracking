# /kiem-tra-truoc-deploy

Dùng trước khi deploy web lên Vercel. Chạy qua checklist sau và báo cáo kết quả từng mục:

1. **Build thử**: chạy `npm run build`, đảm bảo build thành công, không có lỗi TypeScript.
2. **Biến môi trường**: liệt kê các biến `.env` cần thiết (Supabase URL, anon key...) để mình
   copy sang phần Environment Variables trên Vercel. Đảm bảo `.env` không bị commit vào git
   (kiểm tra `.gitignore`).
3. **Responsive**: rà nhanh các trang chính (danh sách, chi tiết, form thêm quán) xem có vỡ
   layout ở màn hình điện thoại (~375px) không.
4. **Ảnh**: đảm bảo ảnh dùng `next/image` để tự tối ưu, không load ảnh gốc quá nặng.
5. **Supabase Row Level Security (RLS)**: kiểm tra lại policy — cho phép đọc công khai (vì
   web hiển thị công khai), nhưng chặn ghi/sửa/xoá từ phía client nếu không qua xác thực.
6. Tóm tắt lại: sẵn sàng deploy hay còn điểm nào cần mình xử lý thêm trước.
