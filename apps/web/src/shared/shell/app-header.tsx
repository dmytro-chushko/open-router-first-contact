'use client';

import { locales } from '@repo/translations';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import type { ThemePreference } from '@/shared/lib/theme-storage';

export function AppHeader() {
  const t = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const selected = (
    mounted ? (theme ?? 'system') : 'system'
  ) as ThemePreference;

  const themeOptions: {
    value: ThemePreference;
    labelKey: 'themeLight' | 'themeDark' | 'themeSystem';
    icon: typeof Sun;
  }[] = [
    { value: 'light', labelKey: 'themeLight', icon: Sun },
    { value: 'dark', labelKey: 'themeDark', icon: Moon },
    { value: 'system', labelKey: 'themeSystem', icon: Monitor },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-end gap-3 px-4 md:h-16 sm:px-6 md:px-8 lg:px-10">
        <nav
          aria-label={t('localeSwitcher')}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1"
        >
          {locales.map((loc) => {
            const active = locale === loc;

            return (
              <Button
                key={loc}
                asChild
                variant={active ? 'secondary' : 'ghost'}
                size="sm"
                className={cn('min-w-10 px-2', active && 'shadow-sm')}
              >
                <Link href={pathname} locale={loc} scroll={false}>
                  {loc.toUpperCase()}
                </Link>
              </Button>
            );
          })}
        </nav>
        <nav
          aria-label={t('themeAppearance')}
          className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1 sm:gap-1"
        >
          {themeOptions.map(({ value, labelKey, icon: Icon }) => {
            const active = selected === value;

            return (
              <Button
                key={value}
                type="button"
                variant={active ? 'secondary' : 'ghost'}
                size="icon-sm"
                aria-pressed={active}
                aria-label={t(labelKey)}
                title={t(labelKey)}
                className={cn(
                  'touch-manipulation h-11 min-h-11 w-11 min-w-11 sm:h-8 sm:min-h-8 sm:w-8 sm:min-w-8',
                  active && 'shadow-sm'
                )}
                onClick={() => setTheme(value)}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
