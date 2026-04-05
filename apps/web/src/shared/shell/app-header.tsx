'use client';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';

import { useTheme } from './theme-provider';

import type { ThemePreference } from '@/shared/lib/theme-storage';

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Світла тема', icon: Sun },
  { value: 'dark', label: 'Темна тема', icon: Moon },
  { value: 'system', label: 'Як у системи', icon: Monitor },
];

export function AppHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-end px-4 sm:h-16 sm:px-6 md:px-8 lg:px-10">
        <nav
          aria-label="Тема оформлення"
          className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-1 sm:gap-1"
        >
          {options.map(({ value, label, icon: Icon }) => {
            const active = theme === value;

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
                  'size-9 min-h-11 min-w-11 touch-manipulation sm:size-8 sm:min-h-8 sm:min-w-8',
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
