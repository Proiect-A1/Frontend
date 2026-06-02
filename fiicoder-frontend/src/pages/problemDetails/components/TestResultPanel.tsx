import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { DoneSubtaskEvent, ProblemTestDetailsDTO } from '../types/problemDetails';
import { formatScore } from '../utils/textUtils';
import {
    submissionVerdict,
    submissionVerdictLabels,
    type SubmissionVerdict,
} from '../../profile/profileUtils';
import { translations } from '../../../language/Language';

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
    OK:      'border-green-500/40    bg-green-500/10    text-green-300',
    SUPER:   'border-emerald-400/60  bg-emerald-400/15  text-emerald-300',
    WA:      'border-red-500/40      bg-red-500/10      text-red-300',
    PE:      'border-orange-500/40   bg-orange-500/10   text-orange-300',
    PA:      'border-amber-500/40    bg-amber-500/10    text-amber-300',
    TLE:     'border-amber-500/40    bg-amber-500/10    text-amber-300',
    MLE:     'border-violet-500/40   bg-violet-500/10   text-violet-300',
    ILE:     'border-amber-500/40    bg-amber-500/10    text-amber-300',
    RTE:     'border-red-500/40      bg-red-500/10      text-red-300',
    CPE:     'border-purple-500/40   bg-purple-500/10   text-purple-300',
    FAIL:    'border-rose-600/50     bg-rose-600/10     text-rose-300',
    SKIP:    'border-gray-500/40     bg-gray-500/10     text-gray-300',
    NONE:    'border-gray-500/30     bg-gray-500/5      text-gray-400',
    IDLE:    'border-gray-500/30     bg-gray-500/5      text-gray-400',
    OTHER:   'border-gray-500/30     bg-gray-500/5      text-gray-400',
    PENDING: 'border-sky-500/40      bg-sky-500/10      text-sky-300',
};

// Card + badge styles pentru verdictele fatale (FAIL / CPE) care înlocuiesc complet
// afișajul de punctaj și ascund testele.
const fatalVerdictStyle: Record<string, { card: string; badge: string; scoreText: string }> = {
    FAIL: {
        card:      'border-rose-600/50   bg-rose-600/10',
        badge:     'border-rose-600/60   bg-rose-600/20   text-rose-300',
        scoreText: 'text-rose-300',
    },
    CPE: {
        card:      'border-purple-500/50 bg-purple-500/10',
        badge:     'border-purple-500/60 bg-purple-500/20 text-purple-300',
        scoreText: 'text-purple-300',
    },
};

const verdictIcons: Record<string, string> = {
    OK: '✓',
    SUPER: '★',
    WA: '✗',
    PE: '~',
    PA: '◑',
    TLE: '⏱',
    MLE: '⚠',
    ILE: '⏱',
    RTE: '!',
    CPE: '{}',
    FAIL: '✗',
    SKIP: '—',
    NONE: '·',
    IDLE: '·',
    OTHER: '?',
    PENDING: '…',
};

type Props = {
    evalStatus: string;
    evalError?: string | null;
    evalSummary?: any;
    evalTests: any[];
    evalSubtasks: DoneSubtaskEvent[];
    evalElapsedMs?: number | null;
    lang: string;
    problemTests?: ProblemTestDetailsDTO | null;
};

function TestRow({ t, idx }: { t: any; idx: number }) {
    const color = verdictColors[t.verdict] ?? 'border-(--accent)/30 bg-(--accent)/10 text-(--text-muted)';
    const isPending = t.verdict === 'PENDING';
    const timeMs = t.time ? t.time.toFixed(0) : '0';
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
            <span className="text-[10px] font-bold text-(--text-muted) ml-auto shrink-0">
                {t['score%'] != null ? `${Math.round(t['score%'] * 100)}%` : '-'}
            </span>
            <span className="hidden @[320px]:block text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">{timeMs}ms</span>
            <span className="hidden @[320px]:block text-[10px] font-mono text-(--text-subtle) shrink-0 w-16 text-right">{memKB}KB</span>
        </motion.div>
    );
}

const CONFETTI_COLORS = [
    '#22c55e', '#86efac', '#4ade80', '#fbbf24', '#a78bfa',
    '#38bdf8', '#f472b6', '#fb923c', '#e879f9', '#34d399',
    '#60a5fa', '#facc15', '#f87171', '#a3e635',
];
const PARTICLE_COUNT = 140;

type ParticleDef = {
    id: number; x: number; color: string; width: number; height: number;
    isCircle: boolean; rotate: number; delay: number; duration: number;
    drift: number; rotateEnd: number; yEnd: number;
};

function Confetti() {
    const particles = useRef<ParticleDef[]>(
        Array.from({ length: PARTICLE_COUNT }, (_, i) => {
            const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
            return {
                id: i,
                x: Math.random() * 100,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                width: 5 + Math.random() * 11,
                height: 3 + Math.random() * 7,
                isCircle: Math.random() > 0.65,
                rotate: Math.random() * 360,
                delay: Math.random() * 0.6,
                duration: 1.5 + Math.random() * 1.2,
                drift: (Math.random() - 0.5) * 220,
                rotateEnd: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
                yEnd: vh * 1.15,
            };
        })
    ).current;

    return createPortal(
        <div
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}
            aria-hidden="true"
        >
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: 0,
                        width: p.width,
                        height: p.isCircle ? p.width : p.height,
                        backgroundColor: p.color,
                        borderRadius: p.isCircle ? '50%' : '2px',
                    }}
                    initial={{ y: -24, opacity: 1, rotate: p.rotate, x: 0 }}
                    animate={{
                        y: p.yEnd,
                        opacity: [1, 1, 1, 0.6, 0],
                        rotate: p.rotate + p.rotateEnd,
                        x: p.drift,
                    }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
                />
            ))}
        </div>,
        document.body
    );
}

export default function TestResultPanel({ evalStatus, evalError, evalSummary, evalTests, evalSubtasks, evalElapsedMs, lang, problemTests }: Props) {
    // `t` is used throughout this file as a test-object variable; use `tr` for translations.
    const tr = translations[lang as 'RO' | 'EN'] ?? translations.RO;
    const [expandedSubtasks, setExpandedSubtasks] = useState<Set<number>>(new Set());
    const [showConfetti, setShowConfetti] = useState(false);
    const prevStatus = useRef<string>('idle');

    useEffect(() => {
        if (evalStatus === 'done' && prevStatus.current === 'evaluating' && evalSummary) {
            const verdict = evalSummary.score >= evalSummary.maxScore && evalSummary.maxScore > 0;
            if (verdict) {
                setShowConfetti(true);
                // max particle lifetime = delay(1.0) + duration(4.2) = 5.2s → wait for all to finish
                const timer = setTimeout(() => setShowConfetti(false), 5800);
                return () => clearTimeout(timer);
            }
        }
        prevStatus.current = evalStatus;
    }, [evalStatus, evalSummary]);

    const toggleSubtask = (id: number) => {
        setExpandedSubtasks(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Map subtaskId -> testIndex values (global sandbox test ids, may overlap between subtasks for cumulative scoring)
    const subtaskTestIds = new Map<number, number[]>();
    if (problemTests) {
        problemTests.subtasks.forEach(subtask => {
            subtaskTestIds.set(subtask.index, subtask.tests.map(t => t.testIndex));
        });
    }

    // Tests that don't belong to any known subtask (fallback)
    const assignedTestIds = new Set([...subtaskTestIds.values()].flat());
    const orphanTests = evalTests.filter(t => !assignedTestIds.has(t.testId));

    return (
        <div className="relative h-full p-4 bg-(--surface-card) overflow-y-auto overflow-x-hidden custom-scrollbar @container">
            {showConfetti && <Confetti />}
            {evalStatus === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-(--accent)/5 border-2 border-dashed border-(--accent)/20 flex items-center justify-center mb-3">
                        <span className="text-xl opacity-30">▶</span>
                    </div>
                    <p className="text-xs text-(--text-muted) italic">
                        {tr.submitToSeeResults}
                    </p>
                    <p className="mt-2 text-[10px] text-(--text-muted) opacity-60">
                        {tr.shortcutLabel}{' '}
                        <kbd className="px-1 py-0.5 rounded border border-(--accent)/20 bg-(--surface-muted) font-mono text-[9px]">Ctrl</kbd>
                        {' + '}
                        <kbd className="px-1 py-0.5 rounded border border-(--accent)/20 bg-(--surface-muted) font-mono text-[9px]">↵</kbd>
                    </p>
                </div>
            )}

            {evalStatus === 'connecting' && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <div className="animate-spin w-8 h-8 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                    <p className="text-xs text-(--text-muted)">{tr.testResultSubmitting}</p>
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
                            const fatalTest = evalStatus === 'done'
                                ? evalTests.find(t => t.verdict === 'FAIL' || t.verdict === 'CPE')
                                : undefined;
                            const fatal = fatalTest ? fatalVerdictStyle[fatalTest.verdict] : null;
                            if (fatal && fatalTest) {
                                return (
                                    <div className={`p-4 rounded-2xl border-2 ${fatal.card}`}>
                                        <div className="flex flex-col gap-2 @[180px]:flex-row @[180px]:items-center @[180px]:justify-between">
                                            <span className={`text-xl @[220px]:text-2xl font-black ${fatal.scoreText}`}>
                                                {verdictIcons[fatalTest.verdict] ?? ''} {fatalTest.verdict}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 self-start @[180px]:self-auto ${fatal.badge}`}>
                                                {fatalTest.verdict}
                                            </span>
                                        </div>
                                        {evalElapsedMs != null && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-(--text-muted)">
                                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                                                </svg>
                                                <span>{tr.evalTimeLabel}</span>
                                                <span className="font-mono font-bold text-(--text-h)">
                                                    {evalElapsedMs < 1000 ? `${evalElapsedMs}ms` : `${(evalElapsedMs / 1000).toFixed(1)}s`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            const summaryVerdict = submissionVerdict({ status: 'FINISHED', score: evalSummary.score });
                            const verdictLabel = submissionVerdictLabels[summaryVerdict][lang === 'RO' ? 'ro' : 'en'];
                            return (
                                <div className={`p-4 rounded-2xl border-2 ${summaryBorderClasses[summaryVerdict]}`}>
                                    <div className="flex flex-col gap-2 @[180px]:flex-row @[180px]:items-center @[180px]:justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xl @[220px]:text-2xl font-black ${summaryScoreTextClasses[summaryVerdict]}`}>
                                                {formatScore(evalSummary.score)}/{formatScore(evalSummary.maxScore)}
                                            </span>
                                            <span className="hidden @[180px]:block text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
                                                {tr.pointsLabel}
                                            </span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 self-start @[180px]:self-auto ${summaryBadgeClasses[summaryVerdict]}`}>
                                            {verdictLabel}
                                        </span>
                                    </div>
                                    {evalElapsedMs != null && (
                                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-(--text-muted)">
                                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                                            </svg>
                                            <span>
                                                {tr.evalTimeLabel}
                                            </span>
                                            <span className="font-mono font-bold text-(--text-h)">
                                                {evalElapsedMs < 1000
                                                    ? `${evalElapsedMs}ms`
                                                    : `${(evalElapsedMs / 1000).toFixed(1)}s`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    ) : (
                        <div className="p-3 rounded-2xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center gap-3">
                            <div className="animate-spin w-4 h-4 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                            <span className="text-xs font-bold text-(--text-muted)">
                                {`${tr.evaluatingPrefix}${evalTests.length}${tr.evaluatingSuffix}`}
                            </span>
                        </div>
                    )}

                    {/* Subtasks — ascunse când există un test cu verdict fatal (FAIL/CPE) */}
                    {evalSubtasks.length > 0 && !(evalStatus === 'done' && evalTests.some(t => t.verdict === 'FAIL' || t.verdict === 'CPE')) && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) px-1 whitespace-nowrap">
                                {tr.subtasksLabel}
                            </p>
                            {evalSubtasks.map((st) => {
                                const testIds = subtaskTestIds.get(st.subtaskId) ?? [];
                                const subtaskTests = evalTests.filter(t => testIds.includes(t.testId));
                                const hasPendingTests = subtaskTests.some(t => t.verdict === 'PENDING');
                                const full = st.maxScore === 0 || st.score >= st.maxScore;
                                const partial = st.score > 0 && !full;
                                const subtaskVerdict: SubmissionVerdict = hasPendingTests ? 'PENDING' : full ? 'ACCEPTED' : partial ? 'PARTIAL' : 'REJECTED';
                                const color = `${summaryBorderClasses[subtaskVerdict]} ${subtaskTextColor[subtaskVerdict]}`;
                                const badgeClasses = summaryBadgeClasses[subtaskVerdict];
                                const verdictLabel = submissionVerdictLabels[subtaskVerdict][lang === 'RO' ? 'ro' : 'en'];
                                const maxMemKB = st.max_memory > 0 ? (st.max_memory / 1024).toFixed(0) : '-';
                                const maxTimeMs = st.max_time > 0 ? st.max_time.toFixed(0) : '-';
                                const isExpanded = expandedSubtasks.has(st.subtaskId);

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
                                            <span className="text-[10px] font-mono font-bold shrink-0 min-w-0">
                                                ST#{st.subtaskId}
                                            </span>
                                            <span className={`hidden @[195px]:block px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${badgeClasses} shrink-0`}>
                                                {verdictLabel}
                                            </span>
                                            <span className="text-[10px] font-black ml-auto shrink-0">
                                                {formatScore(st.score)}/{formatScore(st.maxScore)}
                                            </span>
                                            <span className="hidden @[320px]:block text-[10px] font-mono text-(--text-subtle) shrink-0 w-14 text-right">
                                                {maxTimeMs}ms
                                            </span>
                                            <span className="hidden @[320px]:block text-[10px] font-mono text-(--text-subtle) shrink-0 w-16 text-right">
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
                    {orphanTests.length > 0 && !(evalStatus === 'done' && evalTests.some(t => t.verdict === 'FAIL' || t.verdict === 'CPE')) && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) px-1 whitespace-nowrap">
                                {tr.testsLabel}
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
