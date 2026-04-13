import { defaultLocale, locales } from '@repo/translations';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
  alternateLinks: false,
});
