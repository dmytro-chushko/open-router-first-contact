import en from '../locales/en.json' with { type: 'json' };
import uk from '../locales/uk.json' with { type: 'json' };

export const locales = ['en', 'uk'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export type Messages = typeof en;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<Record<string, unknown>>
): T {
  const result = { ...base } as Record<string, unknown>;

  for (const key of Object.keys(override)) {
    const o = override[key];
    const b = base[key as keyof T];

    if (o === undefined) {
      continue;
    }

    if (isPlainObject(b) && isPlainObject(o)) {
      result[key] = deepMerge(b, o);
    } else {
      result[key] = o;
    }
  }

  return result as T;
}

export function getMessagesForLocale(locale: string): Messages {
  if (locale === 'uk') {
    return deepMerge(
      en as Record<string, unknown>,
      uk as Partial<Record<string, unknown>>
    ) as Messages;
  }

  return en;
}

export { en, uk };
