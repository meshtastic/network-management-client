import i18next, { use, init } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@app/locales/en/translation.json";

use(LanguageDetector);
use(initReactI18next);

void init({
  debug: true,
  fallbackLng: "en",
  defaultNS: "translation",
  interpolation: {
    escapeValue: false, // Not needed for react as it escapes by default
  },
  resources: {
    en: { translation: en },
  },
});

export default i18next;
