import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('system');

  return (
    <div className="bg-background flex h-full flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('notFoundTitle')}</CardTitle>
          <CardDescription>{t('notFoundDescription')}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/chat">{t('goToChat')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
