import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Difficulty } from "../types/problem";

type Language = "RO" | "EN";

export const translations = {
  RO: {
    // Login
    loginTitle: "Autentificare",
    registerTitle: "Înregistrare",
    emailLabel: "Email sau Nume utilizator",
    passwordLabel: "Parolă",
    registerBtn: "Creează cont",
    noAccount: "Nu ai un cont?",
    hasAccount: "Ai deja un cont?",
    // Problem List & Sidebars
    filterTitle: "Căutare & Filtre",
    searchLabel: "Nume problemă",
    difficultyLabel: "Dificultate",
    allOption: "Toate",
    clearFilters: "Șterge filtrele",
    statsTitle: "Statistici",
    statSolved: "Rezolvate",
    statRate: "Rată de Succes",
    statStreak: "Zile consecutive",
    statPref: "Dificultate preferată",
    // Problem Details
    submitTitle: "Trimite Soluția",
    placeholderCode: "Scrie soluția ta aici...",
    evalBtn: "Evaluare soluție",
    evalPending: "Evaluare în curs...",
    backToList: "Înapoi la listă",
    systemEval: "Sistem Evaluare",
    checking: "> Se verifică codul trimis...",
    success: "> 100 puncte!",
    // Problem list
    problemsTitle: "Probleme",
    noProblemsFound: "Nu am găsit nicio problemă.",
    easyDifficulty: "Ușoară",
    mediumDifficulty: "Mediu",
    hardDifficulty: "Greu",
    // Navbar
    archiveBtn: "Arhivă probleme",
    loginBtn: "Autentificare",
    disconnectBtn: "Deconectare",
  },
  EN: {
    loginTitle: "Login",
    registerTitle: "Sign Up",
    emailLabel: "Email or Username",
    passwordLabel: "Password",
    registerBtn: "Create Account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    filterTitle: "Search & Filters",
    searchLabel: "Problem Name",
    difficultyLabel: "Difficulty",
    allOption: "All",
    clearFilters: "Clear Filters",
    statsTitle: "Statistics",
    statSolved: "Solved",
    statRate: "Success Rate",
    statStreak: "Daily Streak",
    statPref: "Preferred Difficulty",
    submitTitle: "Submit Solution",
    placeholderCode: "Type your solution here...",
    evalBtn: "Submit Solution",
    evalPending: "Evaluating...",
    backToList: "Back to the problem list",
    systemEval: "Evaluation System",
    checking: "> Checking submitted code...",
    success: "> 100 points!",
    problemsTitle: "Problems",
    noProblemsFound: "No problems found.",
    easyDifficulty: "Easy",
    mediumDifficulty: "Medium",
    hardDifficulty: "Hard",
    archiveBtn: "Problem Archive",
    loginBtn: "Authentication",
    disconnectBtn: "Logout",
  }
};

const difficultyKeyByValue: Record<Difficulty, "easyDifficulty" | "mediumDifficulty" | "hardDifficulty"> = {
  Easy: "easyDifficulty",
  Medium: "mediumDifficulty",
  Hard: "hardDifficulty",
};

export function getDifficultyLabel(lang: Language, difficulty: Difficulty) {
  return translations[lang][difficultyKeyByValue[difficulty]];
}

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "RO",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("RO");

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context;
}
