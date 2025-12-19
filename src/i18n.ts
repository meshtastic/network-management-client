import i18next, { init, use } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@app/locales/en/translation.json";
import ru from "@app/locales/ru/translation.json";

use(LanguageDetector);
use(initReactI18next);

init({
  debug: true,
  fallbackLng: "en",
  defaultNS: "translation",
  interpolation: {
    escapeValue: false, // Not needed for react as it escapes by default
  },
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
});

export { i18next };
