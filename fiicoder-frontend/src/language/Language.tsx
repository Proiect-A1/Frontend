import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Difficulty } from '../types/difficulty';

type Language = 'RO' | 'EN';

export const translations = {
    RO: {
        // Login
        loginTitle: 'Autentificare',
        registerTitle: 'Înregistrare',
        emailLabel: 'Email',
        passwordLabel: 'Parolă',
        registerBtn: 'Creează cont',
        noAccount: 'Nu ai un cont?',
        hasAccount: 'Ai deja un cont?',
        nameLabel: 'Prenume',
        surnameLabel: 'Nume',
        emailPlaceholder: 'ion@fiicoder.com',
        namePlaceholder: 'Ion',
        surnamePlaceholder: 'Popescu',
        loginBtn: 'Autentificare',
        disconnectBtn: 'Deconectare',
        continueAsGuest: 'Continua ca vizitator',
        // Problem List & Sidebars
        filterTitle: 'Filtrare',
        searchLabel: 'Nume problemă',
        difficultyLabel: 'Dificultate',
        allOption: 'Toate',
        clearFilters: 'Șterge filtrele',
        statsTitle: 'Statistici',
        statSolved: 'Rezolvate',
        statRate: 'Rată de Succes',
        statStreak: 'Zile consecutive',
        statPref: 'Dificultate preferată',
        filterSearchPlaceholder: 'Problema 3',
        // Problem Details
        submitTitle: 'Trimite Soluția',
        placeholderCode: 'Scrie soluția ta aici...',
        evalBtn: 'Evaluare soluție',
        evalPending: 'Evaluare în curs...',
        backToList: 'Înapoi la listă',
        systemEval: 'Sistem Evaluare',
        checking: '> Se verifică codul trimis...',
        success: '> 100 puncte!',
        // Problem list
        problemsTitle: 'Probleme',
        noProblemsFound: 'Nu am găsit nicio problemă.',
        easyDifficulty: 'Ușor',
        mediumDifficulty: 'Mediu',
        hardDifficulty: 'Greu',
        contestDifficulty: 'Concurs',
        // Tags
        tagsLabel: 'Tag-uri',
        noTagsAvailable: 'Niciun tag disponibil.',
        // Navbar
        archiveBtn: 'Probleme',
        // Landing
        welcomeTitle: 'Bine ai venit la',
        welcomeDesc:
            'Platforma competitivă de programare pentru studenți. Înscrie-te într-o clasă, rezolvă probleme și devino maestru în coding.',
        viewProblems: 'Vezi Problemele',
        authenticateBtn: 'Autentificare',
        startBtn: 'Să Începem!',
        readyText: 'Gata să-ți testezi abilitățile? Alege-ți nivelul și apasă start!',
        announcementsTitle: 'Anunțuri Importante',
        newProblems: '1000+ Probleme',
        newProblemsDesc: 'De la ușor la foarte greu, pentru orice nivel de abilitate',
        classesMentors: 'Clase si profesori',
        classesMentorsDesc: 'Creeaza clase, colaboreaza cu profesori si gestioneaza teme',
        advancedEditor: 'Editor Avansat',
        advancedEditorDesc: 'Monaco Editor cu syntax highlighting pentru C++, Python, Go...',
        activeStudents: 'Studenți Activi',
        problemsCount: 'Probleme',
        contestsCount: 'Soluții Acceptate',
        satisfactionRate: 'Satisfacție',
        classesTitle: 'Clase',
        classesHubTitle: 'Hub-ul de clase',
        createClassBtn: 'Creează clasa',
        inviteStudentBtn: 'Trimite invitație',
        homeworkTitle: 'Teme',
        openClassBtn: 'Deschide clasa',
        myInvitations: 'Invitațiile mele',
        activeHomework: 'Teme active',
    },
    EN: {
        // login
        loginTitle: 'Login',
        registerTitle: 'Sign Up',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        registerBtn: 'Create Account',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        loginBtn: 'Authentication',
        disconnectBtn: 'Logout',
        emailPlaceholder: 'john@fiicoder.com',
        namePlaceholder: 'John',
        surnamePlaceholder: 'Smith',
        nameLabel: 'Name',
        surnameLabel: 'Surname',
        continueAsGuest: 'Continue as Guest',
        // Search sidebar
        filterTitle: 'Filter',
        searchLabel: 'Problem Name',
        difficultyLabel: 'Difficulty',
        allOption: 'All',
        clearFilters: 'Clear Filters',
        filterSearchPlaceholder: 'Problem 3',
        // Stats sidebar
        statsTitle: 'Statistics',
        statSolved: 'Solved',
        statRate: 'Success Rate',
        statStreak: 'Daily Streak',
        statPref: 'Preferred Difficulty',
        // Problem details page (submissions)
        submitTitle: 'Submit Solution',
        placeholderCode: 'Type your solution here...',
        evalBtn: 'Submit Solution',
        evalPending: 'Evaluating...',
        backToList: 'Back to the problem list',
        systemEval: 'Evaluation System',
        checking: '> Checking submitted code...',
        success: '> 100 points!',
        // Problem list (+difficulties)
        problemsTitle: 'Problems',
        noProblemsFound: 'No problems found.',
        easyDifficulty: 'Easy',
        mediumDifficulty: 'Medium',
        hardDifficulty: 'Hard',
        contestDifficulty: 'Contest',
        // Tags
        tagsLabel: 'Tags',
        noTagsAvailable: 'No tags available.',
        // Navbar
        archiveBtn: 'Problems',
        // Landing
        welcomeTitle: 'Welcome to',
        welcomeDesc:
            'A competitive programming platform for students. Join a class, solve problems, and become a coding master.',
        viewProblems: 'View Problems',
        authenticateBtn: 'Login / Sign Up',
        startBtn: "Let's Begin!",
        readyText: 'Ready to challenge yourself? Pick your level and get started!',
        announcementsTitle: 'Important Announcements',
        newProblems: '1000+ Problems',
        newProblemsDesc: 'From easy to expert, for every skill level',
        classesMentors: 'Classes and Teachers',
        classesMentorsDesc: 'Create classes, work with teachers, and manage homework',
        advancedEditor: 'Advanced Editor',
        advancedEditorDesc: 'Monaco Editor with syntax highlighting for C++, Python, Go...',
        activeStudents: 'Active Students',
        problemsCount: 'Problems',
        contestsCount: 'Accepted Solutions',
        satisfactionRate: 'Satisfaction',
        classesTitle: 'Classes',
        classesHubTitle: 'Class hub',
        createClassBtn: 'Create class',
        inviteStudentBtn: 'Send invite',
        homeworkTitle: 'Homework',
        openClassBtn: 'Open class',
        myInvitations: 'My invitations',
        activeHomework: 'Active homework',
    },
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
