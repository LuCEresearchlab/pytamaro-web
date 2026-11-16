import { match } from '@formatjs/intl-localematcher';
import { useTranslation } from 'next-i18next/pages';
import { useEffect } from 'react';
import useLocalProfile from './useLocalProfile';

import config from '../../next-i18next.config';

const { defaultLocale, locales } = config.i18n;

export default function useLocalTranslation(namespaces: string[] = []) {
  const { i18n, t } = useTranslation(namespaces);
  const { metadata, setPlatformLocale } = useLocalProfile();
  const userPreferredLocale = metadata.platformLocale;

  useEffect(() => {
    let platformLocale = defaultLocale;
    // Use locale from localStorage if it is set and available...
    if (userPreferredLocale !== null && locales.includes(userPreferredLocale)) {
      platformLocale = userPreferredLocale;
    } else {
      // ...otherwise, figure out the best match based on the browser's locale.
      try {
        const browserLocales =
          navigator.languages.length > 0
            ? [...navigator.languages]
            : [navigator.language];
        platformLocale = match(browserLocales, locales, defaultLocale);
      } catch {
        // Malformed locale tags (e.g. raw Accept-Language values from
        // crawlers). Fall back to the default locale.
      }
    }

    // Manually set the locale in next-i18next.
    if (i18n.language !== platformLocale) {
      i18n.changeLanguage(platformLocale);
    }
  }, [i18n, userPreferredLocale]);

  return { t, i18n, setPlatformLocale };
}
