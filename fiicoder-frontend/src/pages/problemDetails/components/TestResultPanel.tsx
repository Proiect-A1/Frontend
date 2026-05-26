import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DoneSubtaskEvent, ProblemTestDetailsDTO } from '../types/problemDetails';
import { formatScore } from '../utils/textUtils';
import {
    submissionVerdict,
    submissionVerdictLabels,
    type SubmissionVerdict,
} from '../../profile/profileUtils';

const summaryBorderClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10',
    PARTIAL: 'border-amber-500/40 bg-amber-500/10',
    REJECTED: 'border-red-500/40 bg-red-500/10',
    PENDING: 'border-sky-500/40 bg-sky-500/10',
};

const summaryScoreTextClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'text-green-400',
    PARTIAL: 'text-amber-400',
    REJECTED: 'text-red-400',
    PENDING: 'text-sky-400',
};

const summaryBadgeClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/50 bg-green-500/20 text-green-300',
    PARTIAL: 'border-amber-500/50 bg-amber-500/20 text-amber-300',
    REJECTED: 'border-red-500/50 bg-red-500/20 text-red-300',
    PENDING: 'border-sky-500/50 bg-sky-500/20 text-sky-300',
};

const subtaskTextColor: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'text-green-300',
    PARTIAL: 'text-amber-300',
    REJECTED: 'text-red-300',
    PENDING: 'text-sky-300',
};

const verdictColors: Record<string, string> = {
    OK: 'border-green-500/40 bg-green-500/10 text-green-300',
    WA: 'border-red-500/40 bg-red-500/10 text-red-300',
    TLE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    MLE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    RTE: 'border-red-500/40 bg-red-500/10 text-red-300',
    CPE: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    FAIL: 'border-red-500/40 bg-red-500/10 text-red-300',
    SKIP: 'border-gray-500/40 bg-gray-500/10 text-gray-300',
    ILE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
};

const verdictIcons: Record<string, string> = {
    OK: '✓',
    WA: '✗',
    TLE: '⏱',
    MLE: '⚠',
    RTE: '!',
    CPE: '{}',
    FAIL: '✗',
    SKIP: '—',
    ILE: '⏱',
    PENDING: '…',
};

type Props = {
    evalStatus: string;
    evalError?: string | null;
    evalSummary?: any;
    evalTests: any[];
    evalSubtasks: DoneSubtaskEvent[];
    lang: string;
    problemTests?: ProblemTestDetailsDTO | null;
};

function TestRow({ t, idx }: { t: any; idx: number }) {
    const color = verdictColors[t.verdict] ?? 'border-(--accent)/30 bg-(--accent)/10 text-(--text-muted)';
    const isPending = t.verdict === 'PENDING';
    const timeMs = t.time ? (t.time / 1_000_000).toFixed(0) : '0';
    const memKB = t.memory ? (t.memory / 1024).toFixed(0) : '0';

    return (
        <motion.div
            key={idx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: idx * 0.02 }}
            className="flex items-center gap-3 p-2 rounded-lg border border-(--accent)/10 bg-(--accent)/5 hover:bg-(--accent)/10 transition-colors"
        >
            <span className="text-[10px] font-mono font-bold text-(--text-subtle) w-6 text-center shrink-0">#{t.testId}</span>
            {isPending ? (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${color} shrink-0 flex items-center gap-1.5`}>
                    <div className="w-2 h-2 rounded-full bg-sky-400/50 animate-ping" />
                    {t.verdict}
                </span>
            ) : (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${color} shrink-0 flex items-center gap-1`}>
                    <span aria-hidden="true">{verdictIcons[t.verdict] ?? ''}</span>
                    {t.verdict}
                </span>
            )}
            <span className="text-[10px] font-bold text-(--text-muted) ml-auto shrink-0">{formatScore(t.score)}/{formatScore(t.maxScore)}</span>
            <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">{timeMs}ms</span>
            <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-16 text-right">{memKB}KB</span>
        </motion.div>
    );
}

export default function TestResultPanel({ evalStatus, evalError, evalSummary, evalTests, evalSubtasks, lang, problemTests }: Props) {
    const [expandedSubtasks, setExpandedSubtasks] = useState<Set<number>>(new Set());

    const toggleSubtask = (id: number) => {
        setExpandedSubtasks(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Map subtaskId -> globally-sequential testIds (matches the pre-populated order in the hook)
    const subtaskTestIds = new Map<number, number[]>();
    if (problemTests) {
        let globalIdx = 0;
        problemTests.subtasks.forEach(subtask => {
            const testIds = subtask.tests.map(() => globalIdx++);
            subtaskTestIds.set(subtask.index, testIds);
        });
    }

    // Tests that don't belong to any known subtask (fallback)
    const assignedTestIds = new Set([...subtaskTestIds.values()].flat());
    const orphanTests = evalTests.filter(t => !assignedTestIds.has(t.testId));

    return (
        <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
            {evalStatus === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-(--accent)/5 border-2 border-dashed border-(--accent)/20 flex items-center justify-center mb-3">
                        <span className="text-xl opacity-30">▶</span>
                    </div>
                    <p className="text-xs text-(--text-muted) italic">
                        {lang === 'RO'
                            ? 'Trimite codul pentru a vedea rezultatele.'
                            : 'Submit your code to see results.'}
                    </p>
                </div>
            )}

            {evalStatus === 'connecting' && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="animate-spin w-8 h-8 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                    <p className="text-xs text-(--text-muted)">{lang === 'RO' ? 'Se trimite...' : 'Submitting...'}</p>
                </div>
            )}

            {evalStatus === 'error' && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <p className="text-xs text-red-400 font-bold">{evalError}</p>
                </div>
            )}

            {(evalStatus === 'evaluating' || evalStatus === 'done') && (
                <div className="space-y-4">
                    {/* Summary */}
                    {evalSummary ? (
                        (() => {
                            const summaryVerdict = submissionVerdict({ status: 'FINISHED', score: evalSummary.score });
                            const verdictLabel = submissionVerdictLabels[summaryVerdict][lang === 'RO' ? 'ro' : 'en'];
                            return (
                                <div className={`p-4 rounded-2xl border-2 ${summaryBorderClasses[summaryVerdict]}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-2xl font-black ${summaryScoreTextClasses[summaryVerdict]}`}>
                                                {formatScore(evalSummary.score)}/{formatScore(evalSummary.maxScore)}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
                                                {lang === 'RO' ? 'puncte' : 'points'}
                                            </span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${summaryBadgeClasses[summaryVerdict]}`}>
                                            {verdictLabel}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center gap-3">
                            <div className="animate-spin w-4 h-4 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                            <span className="text-xs font-bold text-(--text-muted)">
                                {lang === 'RO'
                                    ? `Evaluare... (${evalTests.length} teste)`
                                    : `Evaluating... (${evalTests.length} tests)`}
                            </span>
                        </div>
                    )}

                    {/* Subtasks with collapsible tests */}
                    {evalSubtasks.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) px-1">
                                {lang === 'RO' ? 'Subtask-uri' : 'Subtasks'}
                            </p>
                            {evalSubtasks.map((st) => {
                                const full = st.score >= st.maxScore;
                                const partial = st.score > 0 && !full;
                                const subtaskVerdict: SubmissionVerdict = full ? 'ACCEPTED' : partial ? 'PARTIAL' : 'REJECTED';
                                const color = `${summaryBorderClasses[subtaskVerdict]} ${subtaskTextColor[subtaskVerdict]}`;
                                const badgeClasses = summaryBadgeClasses[subtaskVerdict];
                                const verdictLabel = submissionVerdictLabels[subtaskVerdict][lang === 'RO' ? 'ro' : 'en'];
                                const maxMemKB = st.max_memory ? (st.max_memory / 1024).toFixed(0) : '-';
                                const maxTimeMs = st.max_time ? (st.max_time / 1_000_000).toFixed(0) : '-';
                                const isExpanded = expandedSubtasks.has(st.subtaskId);
                                const testIds = subtaskTestIds.get(st.subtaskId) ?? [];
                                const subtaskTests = evalTests.filter(t => testIds.includes(t.testId));

                                return (
                                    <div key={st.subtaskId}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: st.subtaskId * 0.05 }}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl border ${color} cursor-pointer select-none`}
                                            onClick={() => toggleSubtask(st.subtaskId)}
                                        >
                                            <svg
                                                className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span className="text-[10px] font-mono font-bold w-16 shrink-0">
                                                Subtask #{st.subtaskId}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${badgeClasses} shrink-0`}>
                                                {verdictLabel}
                                            </span>
                                            <span className="text-[10px] font-black ml-auto shrink-0">
                                                {formatScore(st.score)}/{formatScore(st.maxScore)}
                                            </span>
                                            <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">
                                                {maxTimeMs}ms
                                            </span>
                                            <span className="text-[10px] font-mono text-(--text-subtle) shrink-0 w-16 text-right">
                                                {maxMemKB}KB
                                            </span>
                                        </motion.div>

                                        <AnimatePresence initial={false}>
                                            {isExpanded && subtaskTests.length > 0 && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-5 pt-1.5 pb-0.5 space-y-1">
                                                        {subtaskTests.map((t, idx) => (
                                                            <TestRow key={t.testId} t={t} idx={idx} />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Fallback: tests not assigned to any subtask */}
                    {orphanTests.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) px-1">
                                {lang === 'RO' ? 'Teste' : 'Tests'}
                            </p>
                            {orphanTests.map((t, idx) => (
                                <TestRow key={t.testId} t={t} idx={idx} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
