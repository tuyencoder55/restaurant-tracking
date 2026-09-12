# Bộ cấu hình Antigravity — "Sổ tay quán ăn ngon"

Bộ này gồm 3 phần: **Rules** (luật luôn áp dụng), **Workflows** (lệnh gọi bằng `/`), và
**Skills** (kiến thức chuyên sâu, Antigravity tự nạp khi cần đến).

## Cách cài đặt (2 phút)

1. Copy toàn bộ thư mục `.agents/` này vào **thư mục gốc (root)** của project code trên máy bạn
   — ngang hàng với `package.json`.
   ```
   ten-project-cua-ban/
   ├── .agents/          ← copy thư mục này vào đây
   │   ├── rules/
   │   ├── workflows/
   │   └── skills/
   ├── app/
   ├── package.json
   └── ...
   ```
2. Mở lại (hoặc reload) workspace đó trong Antigravity. Antigravity sẽ tự nhận diện:
   - Các file trong `.agents/rules/` → hiện trong mục **Customizations → Rules**
   - Các file trong `.agents/workflows/` → gọi được bằng cách gõ `/them-tinh-nang`,
     `/sua-loi`, `/kiem-tra-truoc-deploy` trong khung chat
   - Các thư mục trong `.agents/skills/` → Antigravity tự đọc khi thấy task liên quan
     (ví dụ hỏi về Supabase, bản đồ, upload ảnh...) — không cần gọi thủ công.
3. Nếu bạn dùng Antigravity cho nhiều project cá nhân khác và muốn áp dụng phong cách làm
   việc chung (mục `02-phong-cach-code.md`) cho MỌI project, có thể copy nội dung file đó vào
   rule toàn cục: `~/.gemini/GEMINI.md`.

## Nội dung bên trong

| Loại | File | Mục đích |
|---|---|---|
| Rule | `00-ngon-ngu.md` | Bắt buộc Antigravity hỏi & trả lời bằng tiếng Việt |
| Rule | `01-tech-stack.md` | Chốt cứng stack: Next.js + Tailwind + Supabase + Leaflet |
| Rule | `02-phong-cach-code.md` | Cách viết code & cách giải thích cho người không chuyên |
| Rule | `03-tinh-nang-cot-loi.md` | Mô hình dữ liệu quán ăn + 5 tính năng chính |
| Workflow | `them-tinh-nang.md` | Quy trình 6 bước khi thêm tính năng mới |
| Workflow | `sua-loi.md` | Quy trình xử lý khi có lỗi/bug |
| Workflow | `kiem-tra-truoc-deploy.md` | Checklist trước khi deploy lên Vercel |
| Workflow | `tham-khao-giao-dien.md` | Dán 1 link web khác để agent mở, chụp, tóm tắt điểm hay và đề xuất áp dụng vào web của mình |
| Skill | `thiet-lap-supabase/` | Schema database, Storage ảnh, RLS policy |
| Skill | `upload-va-toi-uu-anh/` | Luồng upload & tối ưu ảnh món ăn |
| Skill | `ban-do-va-dia-chi/` | Tích hợp Leaflet + geocode địa chỉ Nominatim |
| Skill | `thiet-ke-giao-dien/` | Định hướng UI/UX vì bạn là designer |

## Gợi ý bước tiếp theo
Sau khi cài xong, bạn có thể mở Antigravity và gõ thẳng, ví dụ:

> "Khởi tạo project Next.js + Tailwind + Supabase theo đúng rules đã cấu hình"

rồi dùng `/them-tinh-nang` cho từng tính năng một (nên làm từng cái nhỏ, đừng yêu cầu làm
hết 1 lần — sẽ dễ kiểm soát và học được nhiều hơn).

Nếu thấy 1 web/app nào có giao diện hay, muốn học hỏi, gõ:

> "/tham-khao-giao-dien https://didatedauday.vercel.app/?ref=j2team — muốn học cách họ làm trang chi tiết"

Antigravity sẽ tự mở link, chụp lại, và tóm tắt điểm hay đáng áp dụng trước khi code.

## Cài thêm skill "taste-skill" (khuyên dùng — giúp UI đẹp, bớt "AI-look")

`taste-skill` là 1 skill cộng đồng giúp Antigravity tránh làm UI chung chung kiểu AI (hero
căn giữa, gradient tím, card nhạt nhẽo...), thay vào đó chú ý spacing/typography/animation
tử tế hơn. Rất hợp vì stack của project này là Next.js + Tailwind.

**Cách cài (chọn 1 trong 2 cách):**

1. **Cách nhanh — dùng CLI** (mở terminal, đứng ở thư mục gốc project):
   ```bash
   npx skills add https://github.com/Leonxlnx/taste-skill
   ```
   Lệnh này tự tải và copy skill vào đúng thư mục `.agents/skills/` cho bạn.

2. **Cách thủ công** — nếu không muốn chạy lệnh lạ:
   - Vào repo: https://github.com/Leonxlnx/taste-skill
   - Tải/copy nội dung skill vào `your-project/.agents/skills/taste-skill/`
     (giữ nguyên cấu trúc thư mục như các skill khác trong bộ này, ví dụ
     `thiet-ke-giao-dien/SKILL.md`).

Sau khi cài, không cần gọi thủ công — Antigravity sẽ tự nạp skill này mỗi khi task liên quan
đến tạo/sửa giao diện, cùng lúc với skill `thiet-ke-giao-dien` đã có sẵn trong bộ (2 skill
này không xung đột: `thiet-ke-giao-dien` định hướng nội dung/bố cục theo đúng app quán ăn,
còn `taste-skill` lo phần "gu" thẩm mỹ chung, tránh style AI mặc định).

**Kiểm tra đã cài đúng chưa**: hỏi Antigravity "Bạn đang có những skill nào trong project
này?" — nếu thấy `taste-skill` xuất hiện trong danh sách là ổn.
