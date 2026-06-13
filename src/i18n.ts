import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import fr from './locales/fr/translation.json'
import kiny from './locales/kiny/translation.json'

i18n.use(initReactI18next).init({
    resources: {
        en: {translation: en},
        fr: {translation: fr},
        kiny: {translation: kiny},
    },
    lng: typeof window !== 'undefined'
        ? (localStorage.getItem('i18nextLng') ?? 'kiny')
        : 'kiny',
    fallbackLng: 'kiny',
    interpolation: {
        escapeValue: false
    }
})

export default i18n;