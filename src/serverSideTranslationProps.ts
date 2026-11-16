import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

import config from '../next-i18next.config';

export const defaultLocale: string = config.i18n.defaultLocale;
export const locales: string[] = config.i18n.locales;

export async function translationProps(additionalNamespaces: string[] = []) {
  return serverSideTranslations(
    defaultLocale,
    ['common', ...additionalNamespaces],
    null,
    locales,
  );
}
