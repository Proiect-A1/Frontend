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
    nameLabel: "Prenume",
    surnameLabel: "Nume",
    emailPlaceholder: "ion@fiicoder.com",
    namePlaceholder: "Ion",
    surnamePlaceholder: "Popescu",
    loginBtn: "Autentificare",
    disconnectBtn: "Deconectare",
    continueAsGuest: "Continua ca vizitator",
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
    filterSearchPlaceholder: "Problema 3",
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
    contestDifficulty: "Concurs",
    // Tags
    tagsLabel: "Tag-uri",
    noTagsAvailable: "Niciun tag disponibil.",
    // Navbar
    archiveBtn: "Arhivă probleme",
    // Landing
    welcomeTitle: "Bine venit la",
    welcomeDesc: "Platforma de concursuri de programare pentru studenți. Rezolvă probleme, participă la concursuri și devino maestru în coding.",
    viewProblems: "Vezi Problemele",
    authenticateBtn: "Autentificare",
    startBtn: "Să Începem!",
    readyText: "Gata să-ți testezi abilitățile? Alege-ți nivelul și apasă start!",
    announcementsTitle: "Anunțuri Importante",
    newProblems: "1000+ Probleme",
    newProblemsDesc: "De la ușor la foarte greu, pentru orice nivel de abilitate",
    dailyContests: "Concursuri Zilnice",
    dailyContestsDesc: "Participă la concursuri, câștigă puncte și badges",
    advancedEditor: "Editor Avansat",
    advancedEditorDesc: "Monaco Editor cu syntax highlighting pentru C++, Python, Java...",
    activeStudents: "Studenți Activi",
    problemsCount: "Probleme",
    contestsCount: "Concursuri",
    satisfactionRate: "Satisfacție",
  },
  EN: {
    // login
    loginTitle: "Login",
    registerTitle: "Sign Up",
    emailLabel: "Email or Username",
    passwordLabel: "Password",
    registerBtn: "Create Account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    loginBtn: "Authentication",
    disconnectBtn: "Logout",
    emailPlaceholder: "john@fiicoder.com",
    namePlaceholder: "John",
    surnamePlaceholder: "Smith",
    nameLabel: "Name",
    surnameLabel: "Surname",
    continueAsGuest: "Continue as Guest",
    // Search sidebar
    filterTitle: "Search & Filters",
    searchLabel: "Problem Name",
    difficultyLabel: "Difficulty",
    allOption: "All",
    clearFilters: "Clear Filters",
    filterSearchPlaceholder: "Problem 3",
    // Stats sidebar
    statsTitle: "Statistics",
    statSolved: "Solved",
    statRate: "Success Rate",
    statStreak: "Daily Streak",
    statPref: "Preferred Difficulty",
    // Problem details page (submissions)
    submitTitle: "Submit Solution",
    placeholderCode: "Type your solution here...",
    evalBtn: "Submit Solution",
    evalPending: "Evaluating...",
    backToList: "Back to the problem list",
    systemEval: "Evaluation System",
    checking: "> Checking submitted code...",
    success: "> 100 points!",
    // Problem list (+difficulties)
    problemsTitle: "Problems",
    noProblemsFound: "No problems found.",
    easyDifficulty: "Easy",
    mediumDifficulty: "Medium",
    hardDifficulty: "Hard",
    contestDifficulty: "Contest",
    // Tags
    tagsLabel: "Tags",
    noTagsAvailable: "No tags available.",
    // Navbar
    archiveBtn: "Problem Archive",
    // Landing
    welcomeTitle: "Welcome to",
    welcomeDesc: "A competitive programming platform for students. Solve problems, join contests, and become a coding master.",
    viewProblems: "View Problems",
    authenticateBtn: "Login / Sign Up",
    startBtn: "Let's Begin!",
    readyText: "Ready to challenge yourself? Pick your level and get started!",
    announcementsTitle: "Important Announcements",
    newProblems: "1000+ Problems",
    newProblemsDesc: "From easy to expert, for every skill level",
    dailyContests: "Daily Contests",
    dailyContestsDesc: "Compete, earn points, and unlock badges",
    advancedEditor: "Advanced Editor",
    advancedEditorDesc: "Monaco Editor with syntax highlighting for C++, Python, Java...",
    activeStudents: "Active Students",
    problemsCount: "Problems",
    contestsCount: "Contests",
    satisfactionRate: "Satisfaction",
  }
};

const difficultyKeyByValue: Record<Difficulty, "easyDifficulty" | "mediumDifficulty" | "hardDifficulty" | "contestDifficulty"> = {
  EASY: "easyDifficulty",
  MEDIUM: "mediumDifficulty",
  HARD: "hardDifficulty",
  CONTEST: "contestDifficulty",
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
