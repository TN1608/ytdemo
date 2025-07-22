"use client"

import {createContext, useContext, useState, useEffect, type ReactNode} from "react"

type Language = "en" | "vi"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({children}: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("vi")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Load language from local storage or detect browser language
        const savedLanguage = localStorage.getItem("language") as Language | null
        if (savedLanguage && ["en", "vi"].includes(savedLanguage)) {
            setLanguageState(savedLanguage)
        } else {
            const browserLang = navigator.language.split("-")[0]
            if (browserLang === "vi") {
                setLanguageState("vi")
            }
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setIsLoading(true)
        // Simulate async language switch (e.g., fetching translations)
        setTimeout(() => {
            setLanguageState(lang)
            localStorage.setItem("language", lang)
            setIsLoading(false)
        }, 300) // Short delay for smooth UX
    }

    return (
        <LanguageContext.Provider value={{language, setLanguage, isLoading}}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}