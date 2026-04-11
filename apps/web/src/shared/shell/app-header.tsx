'use client';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import type { ThemePreference } from '@/shared/lib/theme-storage';

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
  { value: 'system', label: 'Match system', icon: Monitor },
];

export function AppHeader() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Until mounted, keep the same "active" slot as SSR (theme is unknown on server → treat as system).
  const selected = (
    mounted ? (theme ?? 'system') : 'system'
  ) as ThemePreference;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-end px-4 md:h-16 sm:px-6 md:px-8 lg:px-10">
        <nav
          aria-label="Theme appearance"
          className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1 sm:gap-1"
        >
          {options.map(({ value, label, icon: Icon }) => {
            const active = selected === value;

            return (
              <Button
                key={value}
                type="button"
                variant={active ? 'secondary' : 'ghost'}
                size="icon-sm"
                aria-pressed={active}
                aria-label={label}
                title={label}
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
