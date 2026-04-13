import { getMessagesForLocale } from '@repo/translations';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

type AppLocale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale =
    requested && routing.locales.includes(requested as AppLocale)
      ? (requested as AppLocale)
      : routing.defaultLocale;

  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});
