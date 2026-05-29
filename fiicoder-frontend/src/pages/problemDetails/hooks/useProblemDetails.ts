import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { submissionService, connectToEvaluation } from '../services/submissionService';
import type { DoneTestEvent, DoneSubtaskEvent, DoneSubmissionEvent, LanguageDTO, ProblemSubmissionDTO, ProblemTestDetailsDTO } from '../types/problemDetails';
import { problemService } from '../../../services/problemService';
import type { ProblemFindResponseDTO } from '../../../services/problemService';
import { useLanguage, translations } from '../../../language/Language';
import { useTheme } from '../../../contexts/ThemeContext';
import { languageService } from '../services/languageService';
import type { OnMount } from '@monaco-editor/react';
import * as FlexLayout from 'flexlayout-react';
import { applyMonacoTheme } from '../../../utils/monacoTheme';
import { unindent } from '../utils/textUtils';
import { unpackTranslation } from '../../../utils/translationPacker';

export function useProblemDetails() {
    const { problemTitle } = useParams();
    const { lang } = useLanguage();
    const t = translations[lang];
    const { isAuthenticated } = useAuth();
    const { theme, customColors } = useTheme();
    const queryClient = useQueryClient();

    const [problem, setProblem] = useState<ProblemFindResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [language, setLanguage] = useState(() => localStorage.getItem('fiicoder_editor_language') ?? 'C++');
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<null | 'pending' | 'valid' | 'invalid'>(null);
    const monacoRef = useRef<any>(null);
    const codeRef = useRef('');

    const [availableLanguages, setAvailableLanguages] = useState<LanguageDTO[]>([]);
    const [selectedLanguageId, setSelectedLanguageId] = useState<string>('');
    const [recentSubmissions, setRecentSubmissions] = useState<ProblemSubmissionDTO[]>([]);
    const [activeTab, setActiveTab] = useState<'testresult' | 'submissions'>('testresult');

    const [evalTests, setEvalTests] = useState<DoneTestEvent[]>([]);
    const [evalSubtasks, setEvalSubtasks] = useState<DoneSubtaskEvent[]>([]);
    const [evalSummary, setEvalSummary] = useState<DoneSubmissionEvent | null>(null);
    const [evalStatus, setEvalStatus] = useState<'idle' | 'connecting' | 'evaluating' | 'done' | 'error'>('idle');
    const [evalError, setEvalError] = useState<string | null>(null);
    const [evalElapsedMs, setEvalElapsedMs] = useState<number | null>(null);
    const evalStartRef = useRef<number | null>(null);
    const [problemTests, setProblemTests] = useState<ProblemTestDetailsDTO | null>(null);
    const wsCleanupRef = useRef<(() => void) | null>(null);
    const handleSubmitRef = useRef<((e: React.FormEvent) => Promise<void>) | null>(null);

    const processedDescription = useMemo(() => {
        if (!problem?.description) return '';
        const unpackedDescription = unpackTranslation(problem.description, lang);
        return unindent(unpackedDescription.replace(/\\\\/g, '\\'));
    }, [problem?.description, lang]);

    const langRef = useRef(lang);
    useEffect(() => { langRef.current = lang; }, [lang]);

    const getDefaultLayout = (currentLang: string) => {
        return {
            global: {
                tabSetTabStripHeight: 36,
                tabEnableClose: false,
                tabEnableRename: false,
                splitterSize: 8,
                tabSetHeaderHeight: 36,
                tabSetEnableTabStrip: true,
                tabSetEnableMaximize: true,
                tabSetMinWidth: 160,
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
                                name: currentLang === 'RO' ? 'Descriere' : 'Description',
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
                                weight: 55,
                                children: [
                                    {
                                        type: 'tab',
                                        name: currentLang === 'RO' ? 'Cod' : 'Code',
                                        component: 'editor',
                                    },
                                ],
                            },
                            {
                                type: 'row',
                                weight: 45,
                                children: [
                                    {
                                        type: 'tabset',
                                        weight: 50,
                                        children: [
                                            {
                                                type: 'tab',
                                                name: currentLang === 'RO' ? 'Rezultat' : 'Result',
                                                component: 'testresult',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'tabset',
                                        weight: 50,
                                        children: [
                                            {
                                                type: 'tab',
                                                name: currentLang === 'RO' ? 'Submisii' : 'Submissions',
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
    };

    const [model, setModel] = useState(() => {
        try {
            const saved = localStorage.getItem('fiicoder_problemdetails_layout_v2');
            if (saved) {
                return FlexLayout.Model.fromJson(JSON.parse(saved));
            }
        } catch {
            // If loading fails, use default
        }
        return FlexLayout.Model.fromJson(getDefaultLayout(lang));
    });

    const handleCodeChange = useCallback((val: string | undefined) => {
        codeRef.current = val ?? '';
    }, []);

    const handleEditorMount: OnMount = useCallback(
        (_editor, monaco) => {
            monacoRef.current = monaco;
            applyMonacoTheme(monaco, theme, { customColors });
            setTimeout(() => _editor.layout(), 100);

        },
        [theme, customColors],
    );

    useEffect(() => {
        if (monacoRef.current) {
            applyMonacoTheme(monacoRef.current, theme, { customColors });
        }
    }, [theme, customColors]);

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
                const [problemDto, langs, testDetails] = await Promise.all([
                    problemService.getProblemByTitle(problemTitle),
                    languageService.getAll().catch(() => []),
                    submissionService.getTests(problemTitle).catch(() => null)
                ]);

                if (!isMounted) return;

                setProblem(problemDto);
                setAvailableLanguages(langs);
                setProblemTests(testDetails);
                if (langs.length > 0) {
                    const savedLangName = localStorage.getItem('fiicoder_editor_language');
                    const savedLang = savedLangName ? langs.find(l => l.name === savedLangName) : null;
                    const cppLang = langs.find(l =>
                        l.name === 'C++' ||
                        l.name?.toLowerCase() === 'cpp' ||
                        l.name?.toLowerCase().includes('c++'),
                    );
                    const defaultLang = savedLang ?? cppLang ?? langs[0];
                    setSelectedLanguageId(defaultLang.id);
                    setLanguage(defaultLang.name);
                }

                if (isAuthenticated && problemTitle) {
                    submissionService
                        .getByProblem(problemTitle)
                        .then((data) => { if (isMounted) setRecentSubmissions(data); })
                        .catch((err) => console.error('Error fetching submissions:', err));
                }
            } catch (err: any) {
                if (isMounted) {
                    if (err?.status === 403) {
                        setError(
                            langRef.current === 'RO'
                                ? 'Nu aveți permisiunea de a vizualiza această problemă.'
                                : 'You do not have permission to view this problem.',
                        );
                    } else {
                        setError(
                            langRef.current === 'RO'
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
    }, [problemTitle, isAuthenticated]);

    useEffect(() => {
        return () => {
            if (wsCleanupRef.current) wsCleanupRef.current();
        };
    }, []);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (codeRef.current.trim()) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isAuthenticated) {
                e.preventDefault();
                handleSubmitRef.current?.({ preventDefault: () => {} } as React.FormEvent);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isAuthenticated]);

    // Called BEFORE action is applied — only used to block rename
    const handleLayoutAction = useCallback((action: FlexLayout.Action) => {
        return action.type === 'FlexLayout_RenameTab' ? undefined : action;
    }, []);

    // Called AFTER the model is updated — correct place to persist the layout
    const handleLayoutSave = useCallback((updatedModel: FlexLayout.Model) => {
        try {
            localStorage.setItem('fiicoder_problemdetails_layout_v2', JSON.stringify(updatedModel.toJson()));
        } catch {
            // Silently fail if localStorage is unavailable
        }
    }, []);

    const resetLayout = useCallback(() => {
        localStorage.removeItem('fiicoder_problemdetails_layout_v2');
        setModel(FlexLayout.Model.fromJson(getDefaultLayout(langRef.current)));
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const code = codeRef.current;
            if (!problem || !code.trim() || !selectedLanguageId) return;

            if (wsCleanupRef.current) {
                wsCleanupRef.current();
                wsCleanupRef.current = null;
            }

            evalStartRef.current = Date.now();
            setEvalElapsedMs(null);

            // Pre-populate tests and subtasks based on problemTests structure
            let initialTests: DoneTestEvent[] = [];
            let initialSubtasks: DoneSubtaskEvent[] = [];
            if (problemTests && problemTests.subtasks) {
                problemTests.subtasks.forEach(subtask => {
                    initialSubtasks.push({
                        request: "doneSubtask",
                        submissionId: "",
                        subtaskId: subtask.index,
                        score: 0,
                        maxScore: subtask.total_score,
                        "score%": 0,
                        max_memory: 0,
                        max_time: 0
                    });

                    subtask.tests.forEach(test => {
                        initialTests.push({
                            request: "doneTest",
                            submissionId: "",
                            testId: test.testIndex,
                            verdict: "PENDING",
                            message: "",
                            score: 0,
                            maxScore: test.score,
                            "score%": 0,
                            memory: 0,
                            time: 0
                        });
                    });
                });
                initialSubtasks.sort((a, b) => a.subtaskId - b.subtaskId);
            }

            setEvalTests(initialTests);
            setEvalSubtasks(initialSubtasks);
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
                            setEvalTests((prev) => {
                                // If test already exists, update it, else append
                                const existingIndex = prev.findIndex(t => t.testId === event.testId);
                                if (existingIndex >= 0) {
                                    const next = [...prev];
                                    next[existingIndex] = event as DoneTestEvent;
                                    return next;
                                }
                                return [...prev, event as DoneTestEvent];
                            });
                        } else if (event.request === 'doneSubtask') {
                            setEvalSubtasks((prev) => {
                                const existingIndex = prev.findIndex(s => s.subtaskId === event.subtaskId);
                                if (existingIndex >= 0) {
                                    const next = [...prev];
                                    next[existingIndex] = event as DoneSubtaskEvent;
                                    return next;
                                }
                                return [...prev, event as DoneSubtaskEvent];
                            });
                        }
                    },
                    (summary: any) => {
                        if (evalStartRef.current !== null) {
                            setEvalElapsedMs(Date.now() - evalStartRef.current);
                            evalStartRef.current = null;
                        }
                        setEvalSummary(summary);
                        setEvalStatus('done');
                        setStatus(summary.score >= summary.maxScore ? 'valid' : 'invalid');
                        setTimeout(() => setStatus(null), 4000);

                        if (isAuthenticated && problemTitle) {
                            queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
                            submissionService
                                .getByProblem(problemTitle)
                                .then((data) => setRecentSubmissions(data))
                                .catch(() => {});
                        }
                    },
                    (errorMsg: any) => {
                        if (evalStartRef.current !== null) {
                            setEvalElapsedMs(Date.now() - evalStartRef.current);
                            evalStartRef.current = null;
                        }
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
        [isAuthenticated, lang, problem, problemTitle, selectedLanguageId],
    );

    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    }, [handleSubmit]);

    return {
        lang,
        t,
        isAuthenticated,
        problem,
        loading,
        error,
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
        evalElapsedMs,
        processedDescription,
        model,
        handleCodeChange,
        handleEditorMount,
        handleSubmit,
        handleLayoutAction,
        handleLayoutSave,
        resetLayout,
        problemTitle,
        problemTests,
        codeRef,
    };
}

