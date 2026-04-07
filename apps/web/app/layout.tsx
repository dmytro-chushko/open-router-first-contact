import { cn } from '@repo/ui/lib/utils';
import '@repo/ui/styles.css';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';

import { THEME_INLINE_SCRIPT } from '@/shared/lib/theme-inline-script';
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
    <html lang="uk" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-dvh bg-background font-sans text-foreground antialiased',
          geist.variable,
          geistSans.variable,
          geistMono.variable,
          '[--header-height:calc(--spacing(16))] [--header-mobile-height:calc(--spacing(14))]'
        )}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INLINE_SCRIPT}
        </Script>
        <ThemeProvider>
          <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 h-[calc(100vh-var(--header-mobile-height))] md:h-[calc(100vh-var(--header-height))] overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
