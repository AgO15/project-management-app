"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'cognitive-manager-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es');
    const [isHydrated, setIsHydrated] = useState(false);

    // Load language preference from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (stored && (stored === 'es' || stored === 'en')) {
            setLanguageState(stored);
        }
        setIsHydrated(true);
    }, []);

    // Save language preference to localStorage
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    }, []);

    // Toggle between languages
    const toggleLanguage = useCallback(() => {
        const newLang = language === 'es' ? 'en' : 'es';
        setLanguage(newLang);
    }, [language, setLanguage]);

    // Translation function
    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || key;
    }, [language]);

    // Prevent hydration mismatch by rendering null until hydrated
    if (!isHydrated) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Hook for translation only
export function useTranslation() {
    const { t, language } = useLanguage();
    return { t, language };
}
