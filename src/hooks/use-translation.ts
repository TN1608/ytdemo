import {useLanguage} from "@/context/LanguageProvider";
import vi from "@/translations/vi";
import en from "@/translations/en";

const translations = {vi, en};

export function useTranslation() {
    const {language} = useLanguage();

    return (key: string, replacements?: Record<string, string | number>) => {
        const keys = key.split(".");
        let value: any = translations[language as keyof typeof translations];

        for (const k of keys) {
            value = value?.[k];
            if (!value) {
                console.warn(`Translation key "${key}" not found for language "${language}"`);
                return key;
            }
        }

        if (replacements && typeof value === "string") {
            Object.entries(replacements).forEach(([k, v]) => {
                value = value.replace(new RegExp(`{{${k}}}`, "g"), String(v));
            });
        }

        return value;
    };
}