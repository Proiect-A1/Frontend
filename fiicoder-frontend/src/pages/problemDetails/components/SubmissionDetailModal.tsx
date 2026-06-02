import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import { formatScore } from '../utils/textUtils';
import type { ProblemSubmissionDTO, SubmissionStatus, SubmissionSubtaskDTO } from '../types/problemDetails';
import { submissionVerdictLabels, submissionVerdict, type SubmissionVerdict } from '../../profile/profileUtils';
import { submissionService } from '../services/submissionService';
import { translations } from '../../../language/Language';
import { useTheme } from '../../../contexts/ThemeContext';
import { getMonacoLanguageId } from '../../../utils/monacoTheme';

// Register languages once at module level
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('csharp', csharp);

const LIGHT_THEMES = new Set(['fii', 'cream', 'sage', 'olivia', 'mcdonalds']);

type Props = {
    isOpen: boolean;
    onClose: () => void;
    submission: ProblemSubmissionDTO | null;
    lang: string;
};

const verdictBorderClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10 text-green-300',
    PARTIAL:  'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING:  'border-sky-500/40 bg-sky-500/10 text-sky-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};


const subtaskBadgeClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/50 bg-green-500/20 text-green-300',
    PARTIAL:  'border-amber-500/50 bg-amber-500/20 text-amber-300',
    PENDING:  'border-sky-500/50 bg-sky-500/20 text-sky-300',
    REJECTED: 'border-red-500/50 bg-red-500/20 text-red-300',
};

const summaryScoreClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'text-green-400',
    PARTIAL:  'text-amber-400',
    PENDING:  'text-sky-400',
    REJECTED: 'text-red-400',
};

const testVerdictColors: Record<string, string> = {
    OK:    'border-green-500/40   bg-green-500/10   text-green-300',
    SUPER: 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300',
    WA:    'border-red-500/40     bg-red-500/10     text-red-300',
    PE:    'border-orange-500/40  bg-orange-500/10  text-orange-300',
    PA:    'border-amber-500/40   bg-amber-500/10   text-amber-300',
    TLE:   'border-amber-500/40   bg-amber-500/10   text-amber-300',
    MLE:   'border-violet-500/40  bg-violet-500/10  text-violet-300',
    RTE:   'border-red-500/40     bg-red-500/10     text-red-300',
    CPE:   'border-purple-500/40  bg-purple-500/10  text-purple-300',
    FAIL:  'border-rose-600/50    bg-rose-600/10    text-rose-300',
    SKIP:  'border-gray-500/40    bg-gray-500/10    text-gray-300',
    ILE:   'border-amber-500/40   bg-amber-500/10   text-amber-300',
    NONE:  'border-gray-500/30    bg-gray-500/5     text-gray-400',
    IDLE:  'border-gray-500/30    bg-gray-500/5     text-gray-400',
    OTHER: 'border-gray-500/30    bg-gray-500/5     text-gray-400',
};

function stVerdict(st: SubmissionSubtaskDTO): SubmissionVerdict {
    if (st.score >= st.maxScore) return 'ACCEPTED';
    if (st.score > 0) return 'PARTIAL';
    return 'REJECTED';
}

function ResultsTab({ subtasks, score, maxScore, lang }: {
    subtasks: SubmissionSubtaskDTO[];
    score: number;
    maxScore: number;
    lang: string;
}) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const toggle = (idx: number) => setExpanded(prev => {
        const next = new Set(prev);
        next.has(idx) ? next.delete(idx) : next.add(idx);
        return next;
    });

    const overallVerdict = submissionVerdict({ status: 'FINISHED', score });

    return (
        <div className="space-y-4">
            {/* Summary card */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${verdictBorderClasses[overallVerdict]}`}>
                <div className="flex items-center gap-3">
                    <span className={`text-3xl font-black ${summaryScoreClasses[overallVerdict]}`}>
                        {formatScore(score)}<span className="text-lg font-bold opacity-60">/{formatScore(maxScore)}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
                        {t.pointsLabel}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 ${verdictBorderClasses[overallVerdict]}`}>
                    {submissionVerdictLabels[overallVerdict][lang === 'RO' || lang === 'ro' ? 'ro' : 'en']}
                </span>
            </div>

            {/* Subtasks */}
            <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-(--text-muted) px-1">
                    {t.subtasksLabel}
                </p>
                {[...subtasks].sort((a, b) => a.index - b.index).map(st => {
                    const verdict = stVerdict(st);
                    const isExpanded = expanded.has(st.index);
                    const sortedTests = [...st.tests].sort((a, b) => a.index - b.index);
                    const maxTimeMs = st.maxTime > 0 ? st.maxTime.toFixed(0) : '-';
                    const maxMemKB = st.maxMemory > 0 ? (st.maxMemory / 1024).toFixed(0) : '-';

                    return (
                        <div key={st.index} className="rounded-xl overflow-hidden border border-(--accent)/15">
                            <button
                                onClick={() => toggle(st.index)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-(--accent)/5 ${verdictBorderClasses[verdict]} border-0 bg-transparent`}
                            >
                                <svg
                                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} text-(--text-muted)`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-sm font-bold text-(--text-h) w-24 shrink-0">
                                    Subtask #{st.index}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${subtaskBadgeClasses[verdict]} shrink-0`}>
                                    {submissionVerdictLabels[verdict][lang === 'RO' || lang === 'ro' ? 'ro' : 'en']}
                                </span>
                                <span className="text-sm font-black text-(--text-h) ml-auto shrink-0">
                                    {formatScore(st.score)}/{formatScore(st.maxScore)}
                                </span>
                                <div className="flex gap-4 shrink-0 text-right">
                                    <span className="text-xs font-mono text-(--text-muted) w-16">{maxTimeMs}ms</span>
                                    <span className="text-xs font-mono text-(--text-muted) w-16">{maxMemKB}KB</span>
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isExpanded && st.tests.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-(--accent)/10 divide-y divide-(--accent)/10">
                                            <div className="flex items-center gap-3 px-4 py-1.5 bg-(--accent)/5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) w-8">Test</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) w-14">Verdict</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) ml-auto w-16 text-right">{t.timeLabel}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) w-16 text-right">{t.memoryLabel}</span>
                                            </div>
                                            {sortedTests.map(test => {
                                                const color = testVerdictColors[test.verdict] ?? 'border-(--accent)/30 bg-(--accent)/5 text-(--text-muted)';
                                                const timeMs = test.time   > 0 ? `${test.time.toFixed(0)}ms`             : '-';
                                                const memKB  = test.memory > 0 ? `${(test.memory / 1024).toFixed(0)}KB`     : '-';
                                                return (
                                                    <div key={test.index} className="flex items-center gap-3 px-4 py-2 hover:bg-(--accent)/5 transition-colors">
                                                        <span className="text-xs font-mono font-bold text-(--text-subtle) w-8">#{test.index}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border w-14 text-center ${color}`}>
                                                            {test.verdict}
                                                        </span>
                                                        {test.message && (
                                                            <span className="text-[10px] text-(--text-muted) truncate flex-1">{test.message}</span>
                                                        )}
                                                        <span className="text-xs font-mono text-(--text-muted) ml-auto w-16 text-right">{timeMs}</span>
                                                        <span className="text-xs font-mono text-(--text-muted) w-16 text-right">{memKB}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function SubmissionDetailModal({ isOpen, onClose, submission, lang }: Props) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;
    const { theme } = useTheme();
    const isLight = LIGHT_THEMES.has(theme);
    const [results, setResults] = useState<SubmissionStatus | null>(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen || !submission?.id) return;
        setResults(null);
        setLoadingResults(true);
        submissionService.getStatus(submission.id)
            .then(data => setResults(data))
            .catch(() => setResults(null))
            .finally(() => setLoadingResults(false));
    }, [isOpen, submission?.id]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen || !submission) return null;

    const verdict = submissionVerdict({ status: submission.status, score: submission.Score });
    const verdictLabel = submissionVerdictLabels[verdict][lang === 'RO' || lang === 'ro' ? 'ro' : 'en'];
    const languageName = typeof submission.language === 'string'
        ? submission.language
        : (submission.language as any)?.name || 'Unknown';

    const hasSubtasks = results?.subtasks && results.subtasks.length > 0;

    const handleCopy = () => {
        navigator.clipboard.writeText(submission.code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[min(95vw,1200px)] h-[85vh] bg-(--surface-card) border-2 border-(--accent) rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-(--accent)/20 bg-(--surface-muted) shrink-0">
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-(--text-h)">{t.submissionDetails}</h3>
                            <p className="text-xs text-(--text-muted)">
                                {new Date(submission.submissiondate).toLocaleString(t.dateLocale)}
                            </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border-2 shrink-0 ${verdictBorderClasses[verdict]}`}>
                            {verdictLabel}
                        </span>
                        <span className="text-sm font-bold text-(--text-h) shrink-0">
                            {t.scoreLabel}: {formatScore(submission.Score)}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-(--accent)/10 text-(--accent) rounded-md border border-(--accent)/20 shrink-0">
                            {languageName}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-3 w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-(--accent)/10 text-(--text-muted) hover:text-(--accent) transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body: code left, results right */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
                    {/* Code pane */}
                    <div className="relative flex-[55] min-h-0 border-b md:border-b-0 md:border-r border-(--accent)/15 overflow-hidden">
                        <SyntaxHighlighter
                            language={getMonacoLanguageId(languageName)}
                            style={isLight ? vs : vscDarkPlus}
                            className="!h-full !overflow-auto custom-scrollbar !m-0 !rounded-none"
                            customStyle={{
                                margin: 0,
                                padding: '1.25rem',
                                fontSize: '0.875rem',
                                lineHeight: '1.625',
                                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                height: '100%',
                                background: 'var(--surface-editor)',
                                overflow: 'auto',
                                borderRadius: 0,
                            }}
                            codeTagProps={{ style: { fontFamily: 'inherit' } }}
                        >
                            {submission.code}
                        </SyntaxHighlighter>
                        <button
                            onClick={handleCopy}
                            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-(--surface-card) border-2 border-(--accent)/50 text-(--text-muted) hover:text-(--accent) hover:border-(--accent) shadow-lg transition-all z-10 text-xs font-bold"
                            title={t.copyCode}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-green-400">Copiat</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    {t.copyCode}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results pane */}
                    <div className="flex-[45] min-h-0 overflow-y-auto custom-scrollbar p-5">
                        {loadingResults ? (
                            <div className="flex items-center justify-center h-40 gap-3">
                                <div className="animate-spin w-6 h-6 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                <span className="text-sm text-(--text-muted)">{t.loadingLabel}</span>
                            </div>
                        ) : hasSubtasks ? (
                            <ResultsTab
                                subtasks={results!.subtasks}
                                score={submission.Score}
                                maxScore={results!.subtasks.reduce((s, st) => s + st.maxScore, 0)}
                                lang={lang}
                            />
                        ) : submission.status === 'PENDING' ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-2 text-(--text-muted)">
                                <div className="animate-spin w-6 h-6 border-2 border-(--accent)/30 border-t-(--accent) rounded-full" />
                                <p className="text-sm">{t.evaluatingLabel}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 gap-2 text-(--text-muted)">
                                <p className="text-sm italic">{t.noResultsAvailable}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
