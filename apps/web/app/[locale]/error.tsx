'use client';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  void error;
  const t = useTranslations('system');

  return (
    <div className="bg-background flex h-full flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('errorTitle')}</CardTitle>
          <CardDescription>{t('errorDescription')}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset}>
            {t('retry')}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/chat">{t('goToChat')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
