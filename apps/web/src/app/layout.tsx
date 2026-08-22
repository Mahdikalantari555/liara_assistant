import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'دستیار هوش مصنوعی لیارا',
  description: 'پاسخ به سؤال‌های مستندات لیارا با ذکر منبع',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
