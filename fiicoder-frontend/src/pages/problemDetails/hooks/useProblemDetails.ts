import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { submissionService, connectToEvaluation } from '../services/submissionService';
import type { DoneTestEvent, DoneSubtaskEvent, DoneSubmissionEvent, LanguageDTO } from '../types/problemDetails';
import { problemService } from '../../../services/problemService';
import type { ProblemFindResponseDTO } from '../../../services/problemService';
import { useLanguage, translations } from '../../../language/Language';
import { useTheme } from '../../../contexts/ThemeContext';
import { languageService } from '../services/languageService';
import { profileService, type RecentSubmissionDTO } from '../../../services/profileService';
import type { OnMount } from '@monaco-editor/react';
import * as FlexLayout from 'flexlayout-react';
import { applyMonacoTheme, getMonacoThemePalette } from '../../../utils/monacoTheme';
import { unindent } from '../utils/textUtils';

const monacoLanguageMap: Record<string, string> = {
    'C++': 'cpp',
    Python: 'python',
    Java: 'java',
    JavaScript: 'javascript',
    Rust: 'rust',
};

export function useProblemDetails() {
    const { problemTitle } = useParams();
    const { lang } = useLanguage();
    const t = translations[lang];
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();

    const [problem, setProblem] = useState<ProblemFindResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('C++');
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<null | 'pending' | 'valid' | 'invalid'>(null);
    const monacoRef = useRef<any>(null);

    const [availableLanguages, setAvailableLanguages] = useState<LanguageDTO[]>([]);
    const [selectedLanguageId, setSelectedLanguageId] = useState<string>('');
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmissionDTO[]>([]);
    const [activeTab, setActiveTab] = useState<'testcase' | 'testresult' | 'submissions'>('testcase');

    const [evalTests, setEvalTests] = useState<DoneTestEvent[]>([]);
    const [evalSubtasks, setEvalSubtasks] = useState<DoneSubtaskEvent[]>([]);
    const [evalSummary, setEvalSummary] = useState<DoneSubmissionEvent | null>(null);
    const [evalStatus, setEvalStatus] = useState<'idle' | 'connecting' | 'evaluating' | 'done' | 'error'>('idle');
    const [evalError, setEvalError] = useState<string | null>(null);
    const wsCleanupRef = useRef<(() => void) | null>(null);

    const processedDescription = useMemo(() => {
        if (!problem?.description) return '';
        return unindent(problem.description.replace(/\\\\/g, '\\'));
    }, [problem?.description]);

    const [model] = useState(() => {
        const json = {
            global: {
                tabSetTabStripHeight: 36,
                tabEnableClose: false,
                splitterSize: 8,
                tabSetHeaderHeight: 36,
                tabSetEnableTabStrip: true,
                tabSetEnableMaximize: true,
                tabSetMinWidth: 100,
                tabSetMinHeight: 100,
            },
            borders: [],
            layout: {
                type: 'row',
                weight: 100,
                children: [
                    {
                        type: 'tabset',
                        weight: 40,
                        children: [
                            {
                                type: 'tab',
                                name: lang === 'RO' ? 'Descriere' : 'Description',
                                component: 'description',
                            },
                        ],
                    },
                    {
                        type: 'row',
                        weight: 60,
                        children: [
                            {
                                type: 'tabset',
                                weight: 65,
                                children: [
                                    {
                                        type: 'tab',
                                        name: lang === 'RO' ? 'Cod' : 'Code',
                                        component: 'editor',
                                    },
                                ],
                            },
                            {
                                type: 'row',
                                weight: 35,
                                children: [
                                    {
                                        type: 'tabset',
                                        weight: 50,
                                        children: [
                                            {
                                                type: 'tab',
                                                name: lang === 'RO' ? 'Date Test' : 'Testcase',
                                                component: 'testcase',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'tabset',
                                        weight: 50,
                                        children: [
                                            {
                                                type: 'tab',
                                                name: lang === 'RO' ? 'Rezultat' : 'Result',
                                                component: 'testresult',
                                            },
                                            {
                                                type: 'tab',
                                                name: lang === 'RO' ? 'Submisii' : 'Submissions',
                                                component: 'submissions',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };
        return FlexLayout.Model.fromJson(json);
    });

    const handleEditorMount: OnMount = useCallback(
        (_editor, monaco) => {
            monacoRef.current = monaco;
            const palette = getMonacoThemePalette(theme);
            applyMonacoTheme(monaco, theme, {
                extraRules: [
                    { token: 'type', foreground: palette.accentSecondary.replace('#', '') },
                    { token: 'function', foreground: palette.accent.replace('#', '') },
                    { token: 'variable', foreground: palette.text.replace('#', '') },
                ],
            });
            setTimeout(() => _editor.layout(), 100);
        },
        [theme],
    );

    useEffect(() => {
        if (monacoRef.current) {
            const palette = getMonacoThemePalette(theme);
            applyMonacoTheme(monacoRef.current, theme, {
                extraRules: [
                    { token: 'type', foreground: palette.accentSecondary.replace('#', '') },
                    { token: 'function', foreground: palette.accent.replace('#', '') },
                    { token: 'variable', foreground: palette.text.replace('#', '') },
                ],
            });
        }
    }, [theme]);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            if (!problemTitle || problemTitle === 'undefined') {
                if (isMounted) {
                    setError('Titlul problemei lipsește din URL.');
                    setLoading(false);
                }
                return;
            }

            try {
                const [problemDto, langs] = await Promise.all([
                    problemService.getProblemByTitle(problemTitle),
                    languageService.getAll().catch(() => []),
                ]);

                if (!isMounted) return;

                setProblem(problemDto);
                setAvailableLanguages(langs);
                if (langs.length > 0) {
                    setSelectedLanguageId(langs[0].id);
                    setLanguage(langs[0].name);
                }

                if (isAuthenticated) {
                    profileService
                        .getMyProfile(1, 50)
                        .then((data) => {
                            if (isMounted) {
                                const filtered = data.recentSubmissions.content.filter(
                                    (submission) => submission.problemTitle === problemTitle,
                                );
                                setRecentSubmissions(filtered);
                            }
                        })
                        .catch((err) => console.error('Error fetching submissions:', err));
                }
            } catch (err: any) {
                if (isMounted) {
                    if (err?.status === 403) {
                        setError(
                            lang === 'RO'
                                ? 'Nu aveți permisiunea de a vizualiza această problemă.'
                                : 'You do not have permission to view this problem.',
                        );
                    } else {
                        setError(
                            lang === 'RO'
                                ? 'Eroare la încărcarea problemei.'
                                : 'Error loading problem.',
                        );
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        void fetchData();

        return () => {
            isMounted = false;
        };
    }, [problemTitle, isAuthenticated, lang]);

    useEffect(() => {
        return () => {
            if (wsCleanupRef.current) wsCleanupRef.current();
        };
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!problem || !code.trim() || !selectedLanguageId) return;

            if (wsCleanupRef.current) {
                wsCleanupRef.current();
                wsCleanupRef.current = null;
            }

            setEvalTests([]);
            setEvalSubtasks([]);
            setEvalSummary(null);
            setEvalError(null);
            setEvalStatus('connecting');
            setStatus('pending');
            setActiveTab('testresult');

            try {
                const response = await submissionService.submit({
                    problem_title: problem.title,
                    languageId: selectedLanguageId,
                    code,
                });

                setEvalStatus('evaluating');

                const cleanup = connectToEvaluation(
                    response.ticket,
                    (event: any) => {
                        if (event.request === 'doneTest') {
                            setEvalTests((prev) => [...prev, event as DoneTestEvent]);
                        } else if (event.request === 'doneSubtask') {
                            setEvalSubtasks((prev) => [...prev, event as DoneSubtaskEvent]);
                        }
                    },
                    (summary: any) => {
                        setEvalSummary(summary);
                        setEvalStatus('done');
                        setStatus(summary.score >= summary.maxScore ? 'valid' : 'invalid');
                        setTimeout(() => setStatus(null), 4000);

                        if (isAuthenticated && problemTitle) {
                            profileService
                                .getMyProfile(1, 50)
                                .then((data) => {
                                    const filtered = data.recentSubmissions.content.filter(
                                        (submission) => submission.problemTitle === problemTitle,
                                    );
                                    setRecentSubmissions(filtered);
                                })
                                .catch(() => {});
                        }
                    },
                    (errorMsg: any) => {
                        setEvalStatus('error');
                        setEvalError(errorMsg);
                        setStatus(null);
                    },
                );

                wsCleanupRef.current = cleanup;
            } catch (err) {
                setEvalStatus('error');
                setEvalError(lang === 'RO' ? 'Eroare la trimiterea submisiei.' : 'Submission failed.');
                setStatus(null);
                console.error('Eroare la trimiterea submisiei:', err);
            }
        },
        [code, isAuthenticated, lang, problem, problemTitle, selectedLanguageId],
    );

    return {
        lang,
        t,
        isAuthenticated,
        problem,
        loading,
        error,
        code,
        setCode,
        language,
        setLanguage,
        isOpen,
        setIsOpen,
        status,
        setStatus,
        availableLanguages,
        setAvailableLanguages,
        selectedLanguageId,
        setSelectedLanguageId,
        recentSubmissions,
        activeTab,
        setActiveTab,
        evalTests,
        evalSubtasks,
        evalSummary,
        evalStatus,
        evalError,
        processedDescription,
        model,
        handleEditorMount,
        handleSubmit,
        monacoLanguageMap,
        problemTitle,
    };
}

