import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import Cookies from 'js-cookie';

const savedLanguage = Cookies.get('language');

i18n.use(Backend).use(initReactI18next).init({
	backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
	fallbackLng: "en-us",
	lng: savedLanguage || "en-us",
	interpolation: { escapeValue: false },
});

export default i18n;