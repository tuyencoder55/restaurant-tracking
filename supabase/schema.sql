-- ==============================================================================
-- DỰ ÁN: "SỔ TAY QUÁN ĂN NGON" (RESTAURANT TRACKING)
-- FILE: supabase/schema.sql
-- HƯỚNG DẪN: Copy toàn bộ nội dung file này dán vào Supabase -> SQL Editor -> Run
-- ==============================================================================

-- 1. BẬT EXTENSION TỰ TẠO UUID (NẾU CHƯA CÓ)
create extension if not exists "pgcrypto";

-- 2. TẠO CÁC BẢNG DỮ LIỆU CỐT LÕI

-- Bảng quán ăn (restaurants)
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  rating smallint check (rating between 1 and 5),
  note text,
  price_range text,            -- Ví dụ: "35k - 70k"
  google_maps_url text,        -- Link xem trực tiếp trên Google Maps
  is_favorite boolean default false, -- Đánh dấu quán ruột/yêu thích (cho mục Spotlight)
  status text default 'approved',    -- Trạng thái: 'pending' (chờ duyệt) hoặc 'approved' (đã duyệt)
  created_at timestamptz default now()
);

-- Bảng thể loại / thẻ tag (tags)
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Bảng nối nhiều - nhiều giữa quán ăn và thẻ tag (restaurant_tags)
create table if not exists restaurant_tags (
  restaurant_id uuid references restaurants(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (restaurant_id, tag_id)
);

-- Bảng lưu trữ ảnh của quán ăn (restaurant_photos)
create table if not exists restaurant_photos (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  photo_url text not null,
  is_cover boolean default false, -- Đánh dấu ảnh đại diện chính
  created_at timestamptz default now()
);

-- 3. TẠO INDEX ĐỂ TỐI ƯU TỐC ĐỘ TÌM KIẾM & LỌC
create index if not exists idx_restaurants_name on restaurants using gin (to_tsvector('simple', name));
create index if not exists idx_restaurants_created_at on restaurants (created_at desc);
create index if not exists idx_restaurant_tags_tag_id on restaurant_tags (tag_id);
create index if not exists idx_restaurant_photos_restaurant on restaurant_photos (restaurant_id);

-- 4. THIẾT LẬP BẢO MẬT ROW LEVEL SECURITY (RLS)
-- Cho phép mọi người ĐỌC dữ liệu công khai (kể cả khách truy cập xem web)
-- Các thao tác THÊM/SỬA/XOÁ thực hiện qua Next.js Server Action dùng SERVICE_ROLE_KEY

alter table restaurants enable row level security;
alter table tags enable row level security;
alter table restaurant_tags enable row level security;
alter table restaurant_photos enable row level security;

-- Policy đọc (Select): Public xem được
drop policy if exists "Cho phep xem quan an cong khai" on restaurants;
create policy "Cho phep xem quan an cong khai" on restaurants for select using (true);

drop policy if exists "Cho phep xem tag cong khai" on tags;
create policy "Cho phep xem tag cong khai" on tags for select using (true);

drop policy if exists "Cho phep xem restaurant_tags cong khai" on restaurant_tags;
create policy "Cho phep xem restaurant_tags cong khai" on restaurant_tags for select using (true);

drop policy if exists "Cho phep xem anh quan an cong khai" on restaurant_photos;
create policy "Cho phep xem anh quan an cong khai" on restaurant_photos for select using (true);

-- 5. CẤU HÌNH SUPABASE STORAGE CHO BUCKET ẢNH
-- Tạo bucket 'restaurant-photos' ở chế độ public nếu chưa tồn tại
insert into storage.buckets (id, name, public)
values ('restaurant-photos', 'restaurant-photos', true)
on conflict (id) do nothing;

-- Policy cho phép ai cũng xem được ảnh trong bucket 'restaurant-photos'
drop policy if exists "Public xem anh quan an" on storage.objects;
create policy "Public xem anh quan an"
  on storage.objects for select
  using (bucket_id = 'restaurant-photos');

-- 6. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- Thêm các tag phổ biến
insert into tags (name) values
  ('Bún / Phở'),
  ('Cơm tấm / Cơm nhà'),
  ('Lẩu & Nướng'),
  ('Cà phê & Bánh'),
  ('Ăn vặt'),
  ('Hải sản'),
  ('Món chay')
on conflict (name) do nothing;

-- Thêm vài quán ăn mẫu để hiển thị đẹp ngay từ đầu
insert into restaurants (id, name, address, latitude, longitude, rating, note, price_range, is_favorite)
values
  ('a0000001-0000-0000-0000-000000000001', 'Phở Bò Gia Truyền 1986', '45 Bát Đàn, Hoàn Kiếm, Hà Nội', 21.0336, 105.8475, 5, 'Nước dùng trong và ngọt thanh, thịt bò tái lăn mềm thơm. Nên đi sớm trước 8h sáng.', '50k - 85k', true),
  ('a0000002-0000-0000-0000-000000000002', 'Cơm Tấm Ba Ghiền', '84 Đặng Văn Ngữ, Phú Nhuận, TP.HCM', 10.7937, 106.6713, 5, 'Miếng sườn to che kín đĩa, ướp đậm đà, chả trứng bùi béo. Quán ruột trưa cuối tuần.', '70k - 120k', true),
  ('a0000003-0000-0000-0000-000000000003', 'Lẩu Bò Nhà Gỗ', '1 Hoàng Diệu, Phường 5, Đà Lạt', 11.9404, 108.4352, 4, 'Trời se lạnh ăn lẩu bò bắp và đuôi bò chấm chao cực đã. Quán hơi đông vào giờ cao điểm.', '180k - 300k', false),
  ('a0000004-0000-0000-0000-000000000004', 'Cà Phê Giảng', '39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội', 21.0322, 105.8546, 5, 'Cà phê trứng trứ danh, lớp kem trứng đánh bông ngậy mịn không hề tanh.', '35k - 60k', true)
on conflict (id) do nothing;

-- Gắn thẻ tag cho các quán mẫu
insert into restaurant_tags (restaurant_id, tag_id)
select 'a0000001-0000-0000-0000-000000000001', id from tags where name = 'Bún / Phở'
on conflict do nothing;

insert into restaurant_tags (restaurant_id, tag_id)
select 'a0000002-0000-0000-0000-000000000002', id from tags where name = 'Cơm tấm / Cơm nhà'
on conflict do nothing;

insert into restaurant_tags (restaurant_id, tag_id)
select 'a0000003-0000-0000-0000-000000000003', id from tags where name = 'Lẩu & Nướng'
on conflict do nothing;

insert into restaurant_tags (restaurant_id, tag_id)
select 'a0000004-0000-0000-0000-000000000004', id from tags where name = 'Cà phê & Bánh'
on conflict do nothing;

-- Ảnh mẫu đại diện (dùng ảnh đồ ăn chất lượng cao Unsplash)
insert into restaurant_photos (restaurant_id, photo_url, is_cover)
values
  ('a0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80', true),
  ('a0000002-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', true),
  ('a0000003-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=800&q=80', true),
  ('a0000004-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', true)
on conflict do nothing;
