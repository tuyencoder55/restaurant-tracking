---
name: thiet-lap-supabase
description: Dùng khi cần tạo/sửa schema database Supabase, cấu hình Storage lưu ảnh, hoặc viết Row Level Security (RLS) policy cho web quán ăn. Kích hoạt khi làm việc với bảng quán ăn, tags, upload ảnh, hoặc kết nối Supabase client.
---

# Thiết lập Supabase cho "Sổ tay quán ăn ngon"

## Schema đề xuất (Postgres)

```sql
-- Bảng chính: quán ăn
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  rating smallint check (rating between 1 and 5),
  note text,
  created_at timestamptz default now()
);

-- Bảng tag (để dễ lọc, tránh gõ tự do lộn xộn)
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Bảng nối nhiều-nhiều giữa quán ăn và tag
create table restaurant_tags (
  restaurant_id uuid references restaurants(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (restaurant_id, tag_id)
);

-- Ảnh của mỗi quán (1 quán có nhiều ảnh)
create table restaurant_photos (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz default now()
);
```

## Supabase Storage
- Tạo 1 bucket tên `restaurant-photos`, đặt public (vì web hiển thị công khai).
- Đường dẫn ảnh nên có dạng `restaurant-photos/{restaurant_id}/{filename}` để dễ quản lý.

## Row Level Security (RLS) — quan trọng vì đây là web công khai
Bật RLS cho tất cả bảng, rồi thêm policy:

```sql
alter table restaurants enable row level security;

-- Cho phép AI ĐỌC công khai
create policy "Public can read restaurants"
  on restaurants for select
  using (true);

-- KHÔNG tạo policy insert/update/delete cho anon
-- => mọi thao tác ghi phải đi qua Next.js server action dùng service role key
--    (service role key chỉ đặt trong biến môi trường server, không bao giờ lộ ra client)
```
Lặp lại tương tự cho `tags`, `restaurant_tags`, `restaurant_photos`.

## Kết nối trong Next.js
- Tạo file `lib/supabase/client.ts` dùng `anon key` cho các thao tác đọc ở client component.
- Tạo file `lib/supabase/server.ts` dùng `service role key` (chỉ import trong server action /
  route handler) cho thao tác ghi (thêm/sửa/xoá quán ăn).
- Biến môi trường cần có trong `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...   # không có tiền tố NEXT_PUBLIC_, không lộ ra client
  ```
