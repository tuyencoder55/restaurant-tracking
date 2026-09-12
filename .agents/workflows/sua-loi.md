# /sua-loi

Dùng khi web đang bị lỗi (báo lỗi ở console, terminal, hoặc chạy sai như mình mô tả).

1. Đọc kỹ thông báo lỗi (console/terminal/browser) mình cung cấp, hoặc chủ động tìm/log ra
   nếu mình chỉ mô tả hiện tượng ("bấm nút không thấy gì xảy ra"...).
2. Xác định chính xác file/dòng code gây lỗi trước khi sửa — không đoán mò.
3. Giải thích ngắn gọn, dễ hiểu: lỗi này do đâu (ví dụ: "vì bảng Supabase chưa có cột này").
4. Sửa ở mức TỐI THIỂU cần thiết để hết lỗi — không nhân tiện refactor thêm phần không liên quan.
5. Xác nhận đã hết lỗi (chạy lại app, hoặc mô tả cách mình tự kiểm tra).
6. Nếu lỗi có nguy cơ lặp lại (ví dụ do thiếu validate dữ liệu), đề xuất 1 cách phòng tránh
   ngắn gọn, để mình quyết định có làm thêm hay không.
