export const THEME_STORAGE_KEY = 'open-router-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_PREFERENCES: readonly ThemePreference[] = [
  'light',
  'dark',
  'system',
] as const;

export function parseStoredTheme(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }

  return 'system';
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean
): 'light' | 'dark' {
  if (preference === 'dark') {
    return 'dark';
  }

  if (preference === 'light') {
    return 'light';
  }

  return prefersDark ? 'dark' : 'light';
}
