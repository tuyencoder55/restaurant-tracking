import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Trấn Tuyên — Sổ tay ẩm thực & Quán ngon chọn lọc',
  description: 'Cẩm nang tuyển chọn những góc quán đáng nhớ, bản đồ ẩm thực thành phố và gợi ý hương vị mỗi ngày.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={fontSans.variable}>
      <body className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans antialiased selection:bg-[#163323]/15 selection:text-[#163323]">
        {children}
      </body>
    </html>
  );
}
