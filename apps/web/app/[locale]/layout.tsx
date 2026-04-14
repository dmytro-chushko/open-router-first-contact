import { Toaster } from '@repo/ui/components/sonner';
import { cn } from '@repo/ui/lib/utils';
import '@repo/ui/styles.css';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';
import type { ReactNode } from 'react';

import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/shared/providers/query-provider';
import { AppHeader, ThemeProvider } from '@/shared/shell';

import '../globals.css';

const geist = Geist({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-sans',
});

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased',
          geist.variable,
          geistSans.variable,
          geistMono.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <div className="[--header-height:calc(--spacing(16))] [--header-tablet-height:calc(--spacing(14))] [--header-mobile-height:calc(--spacing(18))]">
                <AppHeader />
                <main className="min-h-0 h-[calc(100vh-var(--header-tablet-height))] md:h-[calc(100vh-var(--header-height))] max-sm:h-[calc(100vh-var(--header-mobile-height))] flex-1 overflow-x-clip overflow-y-auto">
                  {children}
                </main>
              </div>
            </QueryProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
