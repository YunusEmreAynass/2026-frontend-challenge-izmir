import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationTR from './tr/translation.json';
import translationEN from './en/translation.json';

const resources = {
    tr: { translation: translationTR },
    en: { translation: translationEN },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'tr', // Varsayılan dil
        fallbackLng: 'en', // Çeviri bulunamazsa kullanılacak dil
        interpolation: {
            escapeValue: false, // React zaten XSS koruması sağlıyor
        },
    });

export default i18n;
