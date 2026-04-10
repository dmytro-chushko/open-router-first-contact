import { cn } from '@repo/ui/lib/utils';
import '@repo/ui/styles.css';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';

import { THEME_INLINE_SCRIPT } from '@/shared/lib/theme-inline-script';
import { QueryProvider } from '@/shared/providers/query-provider';
import { AppHeader, ThemeProvider } from '@/shared/shell';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Open Router Chat',
  description: 'Chat UI powered by OpenRouter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased',
          geist.variable,
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INLINE_SCRIPT}
        </Script>
        <ThemeProvider>
          <QueryProvider>
            <div className="[--header-height:calc(--spacing(18))] [--header-mobile-height:calc(--spacing(16))]">
              <AppHeader />
              <main className="min-h-0 h-[calc(100vh-var(--header-mobile-height))] md:h-[calc(100vh-var(--header-height))] flex-1 overflow-x-clip overflow-y-auto">
                {children}
              </main>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
