import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Difficulty } from '../types/difficulty';

type Language = 'RO' | 'EN';

import ro from './locales/ro.json';
import en from './locales/en.json';

export const translations: Record<'RO' | 'EN', Record<string, string>> = {
    RO: ro as Record<string, string>,
    EN: en as Record<string, string>,
};

const difficultyKeyByValue: Record<
    Difficulty,
    'easyDifficulty' | 'mediumDifficulty' | 'hardDifficulty' | 'contestDifficulty'
> = {
    EASY: 'easyDifficulty',
    MEDIUM: 'mediumDifficulty',
    HARD: 'hardDifficulty',
    CONTEST: 'contestDifficulty',
};

export function getDifficultyLabel(lang: Language, difficulty: Difficulty) {
    return translations[lang][difficultyKeyByValue[difficulty]];
}

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'RO',
    setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>('RO');

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    return context;
}
