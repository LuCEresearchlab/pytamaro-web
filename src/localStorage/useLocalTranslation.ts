import { match } from '@formatjs/intl-localematcher';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import useLocalProfile from './useLocalProfile';

const config = require('../../next-i18next.config');

const { defaultLocale, locales } = config.i18n;

export default function useLocalTranslation(namespaces: string[] = []) {
  const { i18n, t } = useTranslation(namespaces);
  const { metadata, setPlatformLocale } = useLocalProfile();
  const setLocale = metadata.platformLocale;

  useEffect(() => {
    // Use locale from localStorage if it is set and available, otherwise
    // figure out the best match based on the browser's locale.
    const platformLocale = setLocale !== null && locales.includes(setLocale)
      ? setLocale
      : match(navigator.languages, locales, defaultLocale);
    // Manually set the locale in next-i18next.
    if (i18n.language !== platformLocale) {
      i18n.changeLanguage(platformLocale);
    }
  }, [i18n, setLocale]);

  return {
    t,
    i18n,
    setPlatformLocale,
  };
}
