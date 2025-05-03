import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import kiny from './locales/kiny/translation.json'

i18n.use(initReactI18next).init({
    resources: {
        en: {translation: en},
        kiny: {translation: kiny},
    },
    fallbackLng: 'kiny',
    interpolation: {
        escapeValue: false
    }
})

export default i18n;