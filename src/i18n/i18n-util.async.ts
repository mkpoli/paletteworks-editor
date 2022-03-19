// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */

import { initFormatters } from './formatters'
import type { Locales, Translations } from './i18n-types'
import { loadedFormatters, loadedLocales, locales } from './i18n-util'

const localeTranslationLoaders = {
  en: () => import('./en'),
  ja: () => import('./ja'),
  ko: () => import('./ko'),
  zh: () => import('./zh'),
}

export const loadLocaleAsync = async (locale: Locales) => {
  if (loadedLocales[locale]) return

  loadedLocales[locale] = (await localeTranslationLoaders[locale]())
    .default as unknown as Translations
  loadFormatters(locale)
}

export const loadAllLocalesAsync = () =>
  Promise.all(locales.map(loadLocaleAsync))

export const loadFormatters = (locale: Locales) => {
  loadedFormatters[locale] = initFormatters(locale)
}
