import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations (English only)
import commonEn from './locales/en/common.json';
import searchEn from './locales/en/search.json';
import productsEn from './locales/en/products.json';

// Initialize i18next with English only
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        search: searchEn,
        products: productsEn
      }
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

// Always set LTR direction
document.documentElement.lang = 'en';
document.documentElement.dir = 'ltr';

export default i18n;
