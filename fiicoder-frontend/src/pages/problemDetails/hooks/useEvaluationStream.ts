import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { submissionService, connectToEvaluation } from '../services/submissionService';
import type { DoneTestEvent, DoneSubtaskEvent, DoneSubmissionEvent, ProblemSubmissionDTO, ProblemTestDetailsDTO } from '../types/problemDetails';
import type { ProblemFindResponseDTO } from '../../../services/problemService';
import { translations } from '../../../language/Language';

interface UseEvaluationStreamParams {
    problem: ProblemFindResponseDTO | null;
    problemTitle: string | undefined;
    problemTests: ProblemTestDetailsDTO | null;
    selectedLanguageId: string;
    selectedHomeworkId: string | null;
    isAuthenticated: boolean;
    lang: string;
    codeRef: React.MutableRefObject<string>;
    setActiveTab: (tab: 'testresult' | 'submissions') => void;
    onSubmissionsRefresh: (data: ProblemSubmissionDTO[]) => void;
}

/**
 * Owns the live evaluation lifecycle: submitting code, pre-populating the test/
 * subtask grid from the problem's test structure, streaming verdicts over a
 * WebSocket, and exposing the running status/summary. The socket is closed on
 * unmount and before each new submission.
 */
export function useEvaluationStream(params: UseEvaluationStreamParams) {
    const {
        problem,
        problemTitle,
        problemTests,
        selectedLanguageId,
        selectedHomeworkId,
        isAuthenticated,
        lang,
        codeRef,
        setActiveTab,
        onSubmissionsRefresh,
    } = params;

    const queryClient = useQueryClient();

    const [status, setStatus] = useState<null | 'pending' | 'valid' | 'invalid'>(null);
    const [evalTests, setEvalTests] = useState<DoneTestEvent[]>([]);
    const [evalSubtasks, setEvalSubtasks] = useState<DoneSubtaskEvent[]>([]);
    const [evalSummary, setEvalSummary] = useState<DoneSubmissionEvent | null>(null);
    const [evalStatus, setEvalStatus] = useState<'idle' | 'connecting' | 'evaluating' | 'done' | 'error'>('idle');
    const [evalError, setEvalError] = useState<string | null>(null);
    const [evalElapsedMs, setEvalElapsedMs] = useState<number | null>(null);
    const evalStartRef = useRef<number | null>(null);
    const wsCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            if (wsCleanupRef.current) wsCleanupRef.current();
        };
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

            // Pre-populate tests and subtasks based on problemTests structure.
            // Tests are keyed by global testIndex; a test shared across subtasks
            // (cumulative scoring) is added only once to initialTests.
            let initialTests: DoneTestEvent[] = [];
            let initialSubtasks: DoneSubtaskEvent[] = [];
            if (problemTests && problemTests.subtasks) {
                const seenTests = new Map<number, number>(); // testIndex -> maxScore
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
                        if (!seenTests.has(test.testIndex)) {
                            seenTests.set(test.testIndex, test.score);
                        }
                    });
                });
                initialSubtasks.sort((a, b) => a.subtaskId - b.subtaskId);

                const sortedIndices = [...seenTests.keys()].sort((a, b) => a - b);
                initialTests = sortedIndices.map(testIndex => ({
                    request: "doneTest" as const,
                    submissionId: "",
                    testId: testIndex,
                    verdict: "PENDING",
                    message: "",
                    score: 0,
                    maxScore: seenTests.get(testIndex)!,
                    "score%": 0,
                    memory: 0,
                    time: 0
                }));
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
                    ...(selectedHomeworkId ? { homeworkId: selectedHomeworkId } : {}),
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
                                .then((data) => onSubmissionsRefresh(data))
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
                setEvalError((translations[lang as 'RO' | 'EN'] ?? translations.RO).submissionFailed);
                setStatus(null);
                console.error('Eroare la trimiterea submisiei:', err);
            }
        },
        // Dependency list intentionally matches the original god-hook exactly to
        // preserve recreation timing; the other referenced values (problemTests,
        // setActiveTab, codeRef, queryClient, onSubmissionsRefresh) are stable or
        // captured in lockstep with `problem`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isAuthenticated, lang, problem, problemTitle, selectedLanguageId, selectedHomeworkId],
    );

    return {
        status,
        setStatus,
        evalTests,
        evalSubtasks,
        evalSummary,
        evalStatus,
        evalError,
        evalElapsedMs,
        handleSubmit,
    };
}
