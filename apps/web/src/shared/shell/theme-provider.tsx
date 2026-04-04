'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  parseStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '@/shared/lib/theme-storage';

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreferenceFromDom(): ThemePreference | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const raw = document.documentElement.getAttribute('data-theme');

  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw;
  }

  return null;
}

function applyThemeToDom(preference: ThemePreference) {
  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;
  const resolved = resolveTheme(preference, prefersDark);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
  root.setAttribute('data-theme', preference);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useLayoutEffect(() => {
    const stored =
      readPreferenceFromDom() ??
      parseStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    setThemeState(stored);
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    setResolvedTheme(resolveTheme(stored, prefersDark));
  }, []);

  useEffect(() => {
    if (theme !== 'system') {
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const prefersDark = mq.matches;
      setResolvedTheme(resolveTheme('system', prefersDark));
      applyThemeToDom('system');
    };
    mq.addEventListener('change', onChange);

    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    applyThemeToDom(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setResolvedTheme(
      resolveTheme(
        next,
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    );
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return ctx;
}
