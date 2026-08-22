'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <Card className="max-w-md">
        <CardContent className="text-center">
          <h2 className="text-section font-semibold text-foreground">خطایی رخ داد</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error.message || 'لطفاً صفحه را مجدداً بارگذاری کنید.'}</p>
          <Button variant="default" className="mt-4 rounded-pill px-5" onClick={reset}>
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
