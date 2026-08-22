import dynamicImport from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'دستیار هوش مصنوعی لیارا',
  description: 'پاسخ به سؤال‌های مستندات لیارا با ذکر منبع',
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ChatContainer = dynamicImport(() => import('@/components/Chat/ChatContainer'), { ssr: false });

export default function Home() {
  return <ChatContainer />;
}
