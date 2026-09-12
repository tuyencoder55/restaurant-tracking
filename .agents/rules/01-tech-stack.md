# Tech stack cố định của dự án "Sổ tay quán ăn ngon"

Đây là dự án cá nhân (personal project) để lưu lại các quán ăn ngon đã đi qua.
Luôn tuân thủ stack sau, KHÔNG tự ý đổi sang thư viện/framework khác trừ khi mình yêu cầu rõ ràng:

- **Framework**: Next.js (App Router, thư mục `app/`)
- **Ngôn ngữ**: TypeScript, nhưng ưu tiên code đơn giản, dễ đọc hơn là "đúng chuẩn" tuyệt đối
  (mình không phải dev chuyên nghiệp, nên tránh generic phức tạp, tránh over-engineering)
- **Styling**: Tailwind CSS
- **Database + lưu trữ ảnh**: Supabase (Postgres + Supabase Storage), để đồng bộ dữ liệu
  giữa nhiều thiết bị (điện thoại, laptop)
- **Bản đồ**: Leaflet (react-leaflet) + OpenStreetMap — miễn phí, không cần API key
  (xem thêm skill `ban-do-va-dia-chi`)
- **Deploy**: Vercel (miễn phí cho project cá nhân)

## Nguyên tắc chung
- Đây là app cho 1 người dùng (chính mình), KHÔNG cần hệ thống đăng nhập nhiều người dùng
  phức tạp. Nếu cần bảo vệ trang admin/thêm quán, dùng cách đơn giản nhất có thể
  (ví dụ: 1 mật khẩu đơn giản hoặc Supabase magic link), không dựng cả hệ thống auth lớn.
- Luôn hỏi lại nếu một yêu cầu tính năng có thể làm theo nhiều cách khác nhau, thay vì tự
  chọn cách phức tạp nhất.
- Ưu tiên trải nghiệm mobile trước (mobile-first), vì mình sẽ chủ yếu mở web này trên điện thoại
  lúc đang tìm chỗ ăn.
